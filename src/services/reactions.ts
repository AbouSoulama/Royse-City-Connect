import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { SavedItemType } from './savedItems';

export async function fetchReactionCount(itemId: string, type: SavedItemType = 'post'): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const { count, error } = await getSupabase()
    .from('reactions')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('item_type', type)
    .eq('reaction_type', 'like');

  if (error) return 0;
  return count ?? 0;
}

export async function hasUserLiked(
  userId: string | undefined,
  itemId: string,
  type: SavedItemType = 'post'
): Promise<boolean> {
  if (!userId || !isSupabaseConfigured) return false;

  const { data } = await getSupabase()
    .from('reactions')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', type)
    .eq('reaction_type', 'like')
    .maybeSingle();

  return !!data;
}

export async function toggleLike(
  userId: string | undefined,
  itemId: string,
  type: SavedItemType = 'post'
): Promise<boolean> {
  if (!userId || !isSupabaseConfigured) return false;

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', type)
    .eq('reaction_type', 'like')
    .maybeSingle();

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id);
    return false;
  }

  const { error } = await supabase.from('reactions').insert({
    user_id: userId,
    item_id: itemId,
    item_type: type,
    reaction_type: 'like',
  });

  return !error;
}
