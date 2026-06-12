import type { Post, PostCategory } from '../data';
import type { ContentStatus, DbPost } from '../types/database';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { createNotification } from './notifications';
import { posts as mockPosts } from '../data';

function toAppPost(row: DbPost): Post {
  return {
    id: row.id,
    category: row.category,
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
  };
}

export async function fetchApprovedPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    return mockPosts.filter((p) => p.status === 'approved');
  }

  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .eq('status', 'approved')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    return mockPosts.filter((p) => p.status === 'approved');
  }

  return data.map(toAppPost);
}

export async function fetchPostsForAdmin(): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    return mockPosts;
  }

  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return mockPosts;
  }

  return data.map(toAppPost);
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
