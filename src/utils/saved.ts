const KEY = 'rc_saved_posts';

export function getSavedPostIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function isPostSaved(id: string): boolean {
  return getSavedPostIds().includes(id);
}

export function toggleSavePost(id: string): boolean {
  const ids = getSavedPostIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(id);
}

export function savedCount(): number {
  return getSavedPostIds().length;
}
