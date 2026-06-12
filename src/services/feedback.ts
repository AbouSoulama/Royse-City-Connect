import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'design' | 'other';

export interface AppFeedback {
  id: string;
  userId: string | null;
  userName: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
  createdAt: string;
}

function mapRow(row: {
  id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  category: string;
  message: string;
  created_at: string;
}): AppFeedback {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    category: row.category as FeedbackCategory,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function submitFeedback(input: {
  userId?: string;
  userName: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
}): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    const stored = JSON.parse(localStorage.getItem('rcc_feedback_queue') || '[]');
    stored.push({ ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem('rcc_feedback_queue', JSON.stringify(stored));
    return {};
  }

  const { error } = await getSupabase().from('app_feedback').insert({
    user_id: input.userId ?? null,
    user_name: input.userName,
    rating: input.rating,
    category: input.category,
    message: input.message.trim(),
  });

  return error ? { error: error.message } : {};
}

export async function fetchFeedbackForAdmin(): Promise<AppFeedback[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await getSupabase()
    .from('app_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data.map(mapRow);
}
