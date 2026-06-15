import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';

export interface AdminStats {
  totalUsers: number;
  activeUsers7d: number | null;
  pendingReports: number;
  totalBusinesses: number;
  totalEvents: number;
  pendingPosts: number;
  pendingBusinesses: number;
  pendingJobs: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  city: string;
  role: Profile['role'];
  createdAt: string;
  lastSeenAt?: string;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    totalUsers: 0,
    activeUsers7d: null,
    pendingReports: 0,
    totalBusinesses: 0,
    totalEvents: 0,
    pendingPosts: 0,
    pendingBusinesses: 0,
    pendingJobs: 0,
  };

  if (!isSupabaseConfigured) return empty;

  const supabase = getSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    usersRes,
    activeRes,
    reportsRes,
    bizRes,
    eventsRes,
    pendingPostsRes,
    pendingBizRes,
    pendingJobsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen_at', sevenDaysAgo),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    activeUsers7d: activeRes.count ?? 0,
    pendingReports: reportsRes.count ?? 0,
    totalBusinesses: bizRes.count ?? 0,
    totalEvents: eventsRes.count ?? 0,
    pendingPosts: pendingPostsRes.count ?? 0,
    pendingBusinesses: pendingBizRes.count ?? 0,
    pendingJobs: pendingJobsRes.count ?? 0,
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, name, phone, city, role, created_at, last_seen_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error('[admin] fetch users:', error?.message);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    city: p.city,
    role: p.role,
    createdAt: p.created_at,
    lastSeenAt: p.last_seen_at ?? undefined,
  }));
}

export async function touchLastSeen(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await getSupabase().rpc('touch_last_seen');
  } catch {
    // optional — migration may not be applied yet
  }
}
