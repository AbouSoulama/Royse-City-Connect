import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Ensure redirect URL always has https:// — required by Supabase OAuth. */
function toAbsoluteAppUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * URL where Supabase redirects after Google OAuth.
 * Must match Supabase → Authentication → URL Configuration → Redirect URLs exactly.
 */
export function getAuthRedirectUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL as string | undefined;
  if (fromEnv) return toAbsoluteAppUrl(fromEnv);

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    // Never redirect to supabase.co (happens when Site URL is misconfigured)
    if (!hostname.includes('supabase.co') && origin.startsWith('http')) {
      return origin;
    }
  }

  return '';
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
