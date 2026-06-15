import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export type SavedItemType = 'post' | 'event' | 'job' | 'business';

const LOCAL_KEY = 'rc_saved_posts';

function localIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function fetchSavedItemIds(userId?: string): Promise<{ id: string; type: SavedItemType }[]> {
  if (!userId || !isSupabaseConfigured) {
    return localIds().map((id) => ({ id, type: 'post' as SavedItemType }));
  }

  const { data, error } = await getSupabase()
    .from('saved_items')
    .select('item_id, item_type')
    .eq('user_id', userId);

  if (error) {
    console.error('[saved]', error.message);
    return localIds().map((id) => ({ id, type: 'post' as SavedItemType }));
  }

  return (data ?? []).map((r) => ({ id: r.item_id, type: r.item_type as SavedItemType }));
}

export async function isItemSaved(userId: string | undefined, itemId: string, type: SavedItemType = 'post'): Promise<boolean> {
  if (!userId || !isSupabaseConfigured) {
    return localIds().includes(itemId);
  }

  const { data } = await getSupabase()
    .from('saved_items')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', type)
    .maybeSingle();

  return !!data;
}

export async function toggleSavedItem(
  userId: string | undefined,
  itemId: string,
  type: SavedItemType = 'post'
): Promise<boolean> {
  if (!userId || !isSupabaseConfigured) {
    const ids = localIds();
    const next = ids.includes(itemId) ? ids.filter((x) => x !== itemId) : [...ids, itemId];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    return next.includes(itemId);
  }

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', type)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_items').delete().eq('id', existing.id);
    return false;
  }

  const { error } = await supabase.from('saved_items').insert({
    user_id: userId,
    item_id: itemId,
    item_type: type,
  });

  if (error) console.error('[saved]', error.message);
  return !error;
}

export async function savedCount(userId?: string): Promise<number> {
  const items = await fetchSavedItemIds(userId);
  return items.length;
}
