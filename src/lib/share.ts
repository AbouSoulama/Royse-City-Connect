import type { SavedItemType } from '../services/savedItems';

const APP_BASE = typeof window !== 'undefined' ? window.location.origin : '';

export function itemSharePath(itemId: string, type: SavedItemType = 'post'): string {
  const map: Record<SavedItemType, string> = {
    post: `/posts/${itemId}`,
    event: `/events/${itemId}`,
    job: `/jobs/${itemId}`,
    business: `/businesses/${itemId}`,
  };
  return map[type];
}

export function itemShareUrl(itemId: string, type: SavedItemType = 'post'): string {
  return `${APP_BASE}${itemSharePath(itemId, type)}`;
}

export async function shareItem(opts: {
  title: string;
  text?: string;
  itemId: string;
  type?: SavedItemType;
}): Promise<'shared' | 'copied'> {
  const url = itemShareUrl(opts.itemId, opts.type ?? 'post');
  const text = opts.text ?? opts.title;

  if (navigator.share) {
    await navigator.share({ title: opts.title, text, url });
    return 'shared';
  }

  await navigator.clipboard.writeText(`${opts.title}\n${url}`);
  return 'copied';
}

/** Resolve feed post id (e.g. event-uuid) to item type + raw id */
export function resolveFeedItem(post: { id: string; sourceType?: string; sourceId?: string }): {
  itemId: string;
  type: SavedItemType;
} {
  if (post.sourceType && post.sourceId) {
    return { itemId: post.sourceId, type: post.sourceType as SavedItemType };
  }
  return { itemId: post.id, type: 'post' };
}
