import type { Event } from '../data';
import { events as mockEvents } from '../data';
import type { ContentStatus, DbEvent } from '../types/database';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/config';
import { createNotification } from './notifications';

const eventMeta = [
  { emoji: '🎉', color: 'from-crimson to-amber-500' },
  { emoji: '⚖️', color: 'from-navy to-navy-light' },
  { emoji: '🎓', color: 'from-emerald-600 to-teal-700' },
  { emoji: '👩🏾‍💼', color: 'from-purple-600 to-pink-600' },
  { emoji: '📅', color: 'from-amber-500 to-orange-600' },
];

function toAppEvent(row: DbEvent): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    time: row.event_time,
    location: row.location,
    organizer: row.organizer_name,
    city: row.city,
    emoji: row.emoji,
    color: row.color,
    featured: row.featured,
    attendees: row.attendees_count,
    status: row.status,
    image: row.image_url ?? undefined,
  };
}

export async function fetchApprovedEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockEvents : [];
  }

  const { data, error } = await getSupabase()
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('[events] fetchApproved:', error.message);
    return isDemoMode() ? mockEvents : [];
  }

  return (data ?? []).map(toAppEvent);
}

export async function fetchUpcomingEvents(limit = 3): Promise<Event[]> {
  const all = await fetchApprovedEvents();
  return all.slice(0, limit);
}

export async function fetchEventsForAdmin(): Promise<Event[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockEvents : [];
  }

  const { data, error } = await getSupabase()
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('[events] fetchAdmin:', error.message);
    return isDemoMode() ? mockEvents : [];
  }

  return (data ?? []).map(toAppEvent);
}

export async function fetchUserRsvpIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const { data } = await getSupabase()
    .from('event_rsvps')
    .select('event_id')
    .eq('user_id', userId);

  return data?.map((r) => r.event_id) ?? [];
}

export async function toggleRsvp(
  eventId: string,
  userId: string,
  isGoing: boolean
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  if (isGoing) {
    const { error } = await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId);
    return error ? { error: error.message } : {};
  }

  const { error } = await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId });
  return error ? { error: error.message } : {};
}

export async function createEvent(input: {
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  imageUrl?: string;
}): Promise<{ event?: Event; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { error: 'You must be signed in to create an event.' };
  }
  if (session.user.id !== input.organizerId) {
    return { error: 'Session mismatch. Please sign out and sign in again.' };
  }

  const meta = eventMeta[Math.floor(Math.random() * eventMeta.length)];

  const { data, error } = await supabase
    .from('events')
    .insert({
      organizer_id: input.organizerId,
      organizer_name: input.organizerName,
      title: input.title,
      description: input.description,
      event_date: input.date,
      event_time: input.time,
      location: input.location,
      city: input.city,
      emoji: meta.emoji,
      color: meta.color,
      status: 'pending',
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotification({
    userId: input.organizerId,
    type: 'event',
    title: 'Event submitted',
    body: 'Your event is pending admin review.',
  });

  return { event: data ? toAppEvent(data) : undefined };
}

export async function updateEventStatus(
  eventId: string,
  status: ContentStatus
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  const { data: event } = await supabase.from('events').select('organizer_id, title').eq('id', eventId).single();

  const { error } = await supabase.from('events').update({ status }).eq('id', eventId);

  if (error) return { error: error.message };

  if (status === 'approved' && event?.organizer_id) {
    await createNotification({
      userId: event.organizer_id,
      type: 'event',
      title: 'Event approved',
      body: `"${event.title}" is now on the community calendar.`,
    });
  }

  return {};
}

export async function toggleEventFeatured(
  eventId: string,
  featured: boolean
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase().from('events').update({ featured }).eq('id', eventId);
  return error ? { error: error.message } : {};
}
