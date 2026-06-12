import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImage(
  file: File,
  folder: 'posts' | 'businesses' | 'events' | 'avatars' | 'jobs'
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  if (!ALLOWED.includes(file.type)) {
    return { error: 'Only JPEG, PNG, WebP or GIF images are allowed.' };
  }

  if (file.size > MAX_SIZE) {
    return { error: 'Image must be under 5 MB.' };
  }

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be signed in to upload images.' };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl };
}
