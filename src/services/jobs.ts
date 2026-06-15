import type { Job } from '../data';
import { jobs as mockJobs } from '../data';
import type { ContentStatus, DbJob, JobType } from '../types/database';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/config';
import { createNotification } from './notifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function toAppJob(row: DbJob): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    contact: row.contact,
    expires: row.expires_on ?? '',
    postedBy: row.posted_by_name,
    type: row.job_type,
    postedAgo: timeAgo(row.created_at),
    status: row.status,
    image: row.image_url ?? undefined,
  };
}

export async function fetchApprovedJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockJobs : [];
  }

  const { data, error } = await getSupabase()
    .from('jobs')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[jobs] fetchApproved:', error.message);
    return isDemoMode() ? mockJobs : [];
  }

  return (data ?? []).map(toAppJob);
}

export async function fetchJobsForAdmin(): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockJobs : [];
  }

  const { data, error } = await getSupabase()
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[jobs] fetchAdmin:', error.message);
    return isDemoMode() ? mockJobs : [];
  }

  return (data ?? []).map(toAppJob);
}

export async function createJob(input: {
  postedById: string;
  postedByName: string;
  title: string;
  description: string;
  location: string;
  contact: string;
  expires?: string;
  type: JobType;
  imageUrl?: string;
}): Promise<{ job?: Job; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { data, error } = await getSupabase()
    .from('jobs')
    .insert({
      posted_by_id: input.postedById,
      posted_by_name: input.postedByName,
      title: input.title,
      description: input.description,
      location: input.location,
      contact: input.contact,
      expires_on: input.expires ?? null,
      job_type: input.type,
      status: 'pending',
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotification({
    userId: input.postedById,
    type: 'admin',
    title: 'Job posted',
    body: 'Your opportunity is pending admin review.',
  });

  return { job: toAppJob(data) };
}

export async function updateJobStatus(
  jobId: string,
  status: ContentStatus
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  const { data: job } = await supabase.from('jobs').select('posted_by_id, title').eq('id', jobId).single();

  const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);

  if (error) return { error: error.message };

  if (status === 'approved' && job?.posted_by_id) {
    await createNotification({
      userId: job.posted_by_id,
      type: 'admin',
      title: 'Job approved',
      body: `"${job.title}" is now visible to the community.`,
    });
  }

  return {};
}

export async function deleteJob(jobId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase().from('jobs').delete().eq('id', jobId);
  return error ? { error: error.message } : {};
}
