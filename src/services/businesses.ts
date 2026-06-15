import type { Business } from '../data';
import { businesses as mockBusinesses } from '../data';
import type { ContentStatus, DbBusiness } from '../types/database';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/config';
import { createNotification } from './notifications';

const categoryMeta: Record<string, { emoji: string; color: string }> = {
  Grocery: { emoji: '🛒', color: 'from-amber-500 to-orange-600' },
  Restaurant: { emoji: '🍲', color: 'from-crimson to-crimson-dark' },
  Automotive: { emoji: '🔧', color: 'from-slate-600 to-slate-800' },
  Beauty: { emoji: '💇🏾‍♀️', color: 'from-pink-500 to-fuchsia-600' },
  Services: { emoji: '📊', color: 'from-emerald-600 to-teal-700' },
  Fashion: { emoji: '👗', color: 'from-purple-600 to-indigo-700' },
  Health: { emoji: '🏥', color: 'from-teal-600 to-cyan-700' },
  'Real Estate': { emoji: '🏠', color: 'from-blue-600 to-indigo-700' },
};

function toAppBusiness(row: DbBusiness): Business {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    owner: row.owner_name,
    phone: row.phone,
    whatsapp: row.whatsapp || row.phone.replace(/[^0-9+]/g, ''),
    city: row.city,
    address: row.address ?? undefined,
    emoji: row.emoji,
    color: row.color,
    verified: row.verified,
    featured: row.featured,
    rating: Number(row.rating),
    createdAt: row.created_at.slice(0, 10),
    status: row.status,
    image: row.image_url ?? undefined,
  };
}

export async function fetchApprovedBusinesses(): Promise<Business[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode()
      ? mockBusinesses.filter((b) => b.status !== 'pending' && b.status !== 'rejected')
      : [];
  }

  const { data, error } = await getSupabase()
    .from('businesses')
    .select('*')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[businesses] fetchApproved:', error.message);
    return isDemoMode()
      ? mockBusinesses.filter((b) => !b.status || b.status === 'approved')
      : [];
  }

  return (data ?? []).map(toAppBusiness);
}

export async function fetchFeaturedBusinesses(): Promise<Business[]> {
  const all = await fetchApprovedBusinesses();
  return all.filter((b) => b.featured);
}

export async function fetchBusinessesForAdmin(): Promise<Business[]> {
  if (!isSupabaseConfigured) {
    return isDemoMode() ? mockBusinesses : [];
  }

  const { data, error } = await getSupabase()
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[businesses] fetchAdmin:', error.message);
    return isDemoMode() ? mockBusinesses : [];
  }

  return (data ?? []).map(toAppBusiness);
}

export async function createBusiness(input: {
  ownerId: string;
  ownerName: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp?: string;
  city: string;
  address?: string;
  imageUrl?: string;
}): Promise<{ business?: Business; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const meta = categoryMeta[input.category] ?? { emoji: '🏪', color: 'from-navy to-navy-light' };

  const { data, error } = await getSupabase()
    .from('businesses')
    .insert({
      owner_id: input.ownerId,
      owner_name: input.ownerName,
      name: input.name,
      category: input.category,
      description: input.description,
      phone: input.phone,
      whatsapp: input.whatsapp || input.phone.replace(/[^0-9+]/g, ''),
      city: input.city,
      address: input.address ?? null,
      emoji: meta.emoji,
      color: meta.color,
      status: 'pending',
      verified: false,
      featured: false,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotification({
    userId: input.ownerId,
    type: 'business',
    title: 'Business submitted',
    body: 'Your business listing is pending admin review.',
  });

  return { business: toAppBusiness(data) };
}

export async function updateBusinessStatus(
  businessId: string,
  status: ContentStatus
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_id, name')
    .eq('id', businessId)
    .single();

  const updates: Partial<DbBusiness> = { status };
  if (status === 'approved') {
    updates.verified = true;
  }

  const { error } = await supabase.from('businesses').update(updates).eq('id', businessId);

  if (error) return { error: error.message };

  if (status === 'approved' && biz?.owner_id) {
    await createNotification({
      userId: biz.owner_id,
      type: 'business',
      title: 'Business approved',
      body: `"${biz.name}" is now live and verified.`,
    });
  }

  return {};
}

export async function toggleBusinessFeatured(
  businessId: string,
  featured: boolean
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase()
    .from('businesses')
    .update({ featured })
    .eq('id', businessId);

  return error ? { error: error.message } : {};
}

export async function toggleBusinessVerified(
  businessId: string,
  verified: boolean
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await getSupabase()
    .from('businesses')
    .update({ verified })
    .eq('id', businessId);

  return error ? { error: error.message } : {};
}

export async function deleteBusiness(businessId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { error } = await getSupabase().from('businesses').delete().eq('id', businessId);
  return error ? { error: error.message } : {};
}
