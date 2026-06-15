import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { SavedItemType } from './savedItems';

export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';

export interface ContentReport {
  id: string;
  reporterId: string | null;
  itemId: string;
  itemType: string;
  reason: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export async function submitReport(input: {
  reporterId: string;
  itemId: string;
  itemType: SavedItemType;
  reason: ReportReason;
  message?: string;
}): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Reports require Supabase configuration.' };
  }

  const { error } = await getSupabase().from('reports').insert({
    reporter_id: input.reporterId,
    item_id: input.itemId,
    item_type: input.itemType,
    reason: input.reason,
    message: input.message?.trim() || null,
    status: 'pending',
  });

  return error ? { error: error.message } : {};
}

export async function fetchReportsForAdmin(): Promise<ContentReport[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await getSupabase()
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    itemId: r.item_id,
    itemType: r.item_type,
    reason: r.reason,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'dismissed'
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: 'Not configured' };

  const { error } = await getSupabase().from('reports').update({ status }).eq('id', reportId);
  return error ? { error: error.message } : {};
}
