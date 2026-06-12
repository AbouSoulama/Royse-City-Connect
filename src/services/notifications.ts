import { notifications as mockNotifications } from '../data';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { DbNotification } from '../types/database';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toAppNotification(row: DbNotification): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    time: timeAgo(row.created_at),
    unread: row.unread,
  };
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  if (!isSupabaseConfigured) {
    return mockNotifications;
  }

  const { data, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return mockNotifications;
  }

  return data.map(toAppNotification);
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
}): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return {};
  }

  const { error } = await getSupabase().from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    unread: true,
  });

  return error ? { error: error.message } : {};
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  await getSupabase()
    .from('notifications')
    .update({ unread: false })
    .eq('user_id', userId)
    .eq('unread', true);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  await getSupabase().from('notifications').update({ unread: false }).eq('id', id);
}
