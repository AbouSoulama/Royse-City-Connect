import type { Post, PostCategory } from '../data';
import type { ContentStatus, DbPost } from '../types/database';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/config';
import { createNotification } from './notifications';
import { fetchApprovedEvents } from './events';
import { fetchApprovedJobs } from './jobs';
import { fetchApprovedBusinesses } from './businesses';
import { posts as mockPosts } from '../data';

function toAppPost(row: DbPost): Post {
  return {
    id: row.id,
    category: row.category,
    feedCategory: row.category,
    title: row.title,
    body: row.body,
    author: row.author_name,
    city: row.city,
    date: row.created_at.slice(0, 10),
    pinned: row.pinned,
    important: row.important,
    status: row.status,
    image: row.image_url ?? undefined,
    reactions: row.reactions_count,
    sourceType: 'post',
    sourceId: row.id,
  };
}

export function getFeedCategory(post: Post) {
  return post.feedCategory ?? post.category;
}

export async function fetchCommunityFeed(): Promise<Post[]> {
  const [postRows, events, jobs, businesses] = await Promise.all([
    fetchApprovedPosts(),
    fetchApprovedEvents(),
    fetchApprovedJobs(),
    fetchApprovedBusinesses(),
  ]);

  const fromEvents: Post[] = events.map((e) => ({
    id: `event-${e.id}`,
    category: 'news',
    feedCategory: 'event',
    title: e.title,
    body: `${e.description}\n\n📅 ${e.date} • ${e.time}\n📍 ${e.location}`,
    author: e.organizer,
    city: e.city,
    date: e.date,
    status: 'approved',
    image: e.image,
    sourceType: 'event',
    sourceId: e.id,
    linkPage: 'events',
  }));

  const fromJobs: Post[] = jobs.map((j) => ({
    id: `job-${j.id}`,
    category: 'news',
    feedCategory: 'job',
    title: j.title,
    body: `${j.description}\n\n📍 ${j.location}\n💼 ${j.type}${j.expires ? `\n⏳ Expires ${j.expires}` : ''}`,
    author: j.postedBy,
    city: j.location.split(',')[0] || 'Royse City',
    date: new Date().toISOString().slice(0, 10),
    status: 'approved',
    image: j.image,
    sourceType: 'job',
    sourceId: j.id,
    linkPage: 'opportunities',
  }));

  const fromBusinesses: Post[] = businesses.map((b) => ({
    id: `business-${b.id}`,
    category: b.category.toLowerCase().includes('real estate') ? 'realestate' : b.category.toLowerCase().includes('hotel') || b.category.toLowerCase().includes('hospitality') ? 'hospitality' : 'news',
    feedCategory: 'business',
    title: b.name,
    body: `${b.description}\n\n🏷️ ${b.category}${b.address ? `\n📍 ${b.address}` : ''}\n📞 ${b.phone}`,
    author: b.owner,
    city: b.city,
    date: b.createdAt.slice(0, 10),
    status: 'approved',
    image: b.image,
    sourceType: 'business',
    sourceId: b.id,
    linkPage: 'businesses',
  }));

  const merged = [...postRows, ...fromEvents, ...fromJobs, ...fromBusinesses];

  return merged.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });
}

export async function fetchApprovedPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockPosts.filter((p) => p.status === 'approved') : [];
  }

  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .eq('status', 'approved')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[posts] fetchApproved:', error.message);
    return isDemoMode() ? mockPosts.filter((p) => p.status === 'approved') : [];
  }

  return (data ?? []).map(toAppPost);
}

export async function fetchPostsForAdmin(): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockPosts : [];
  }

  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[posts] fetchAdmin:', error.message);
    return isDemoMode() ? mockPosts : [];
  }

  return (data ?? []).map(toAppPost);
}

export async function createPost(input: {
  authorId: string;
  authorName: string;
  category: PostCategory;
  title: string;
  body: string;
  city: string;
  imageUrl?: string;
}): Promise<{ post?: Post; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { data, error } = await getSupabase()
    .from('posts')
    .insert({
      author_id: input.authorId,
      author_name: input.authorName,
      category: input.category,
      title: input.title,
      body: input.body,
      city: input.city,
      status: 'pending',
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotification({
    userId: input.authorId,
    type: 'admin',
    title: 'Post submitted',
    body: 'Your announcement is pending admin review.',
  });

  return { post: toAppPost(data) };
}

export async function updatePostStatus(
  postId: string,
  status: ContentStatus
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  const { data: post } = await supabase
    .from('posts')
    .select('author_id, title')
    .eq('id', postId)
    .single();

  const { error } = await supabase.from('posts').update({ status }).eq('id', postId);

  if (error) return { error: error.message };

  if (status === 'approved' && post?.author_id) {
    await createNotification({
      userId: post.author_id,
      type: 'admin',
      title: 'Your post was approved',
      body: `"${post.title}" is now visible to the community.`,
    });
  }

  return {};
}

export async function togglePostPin(
  postId: string,
  pinned: boolean
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase()
    .from('posts')
    .update({ pinned })
    .eq('id', postId);

  return error ? { error: error.message } : {};
}

export async function deletePost(postId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { error } = await getSupabase().from('posts').delete().eq('id', postId);
  return error ? { error: error.message } : {};
}
