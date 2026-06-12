import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface ProfileUpdate {
  name?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  bio?: string;
}

export async function updateProfile(userId: string, data: ProfileUpdate): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase()
    .from('profiles')
    .update(data)
    .eq('id', userId);

  return error ? { error: error.message } : {};
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<{ error?: string }> {
  return updateProfile(userId, { avatar_url: avatarUrl });
}

export async function fetchUserStats(userId: string): Promise<{ posts: number; events: number }> {
  if (!isSupabaseConfigured) {
    return { posts: 0, events: 0 };
  }

  const supabase = getSupabase();
  const [postsRes, rsvpsRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('event_rsvps').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    posts: postsRes.count ?? 0,
    events: rsvpsRes.count ?? 0,
  };
}
