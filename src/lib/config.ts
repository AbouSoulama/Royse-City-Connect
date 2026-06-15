/** Demo/mock data only when explicitly enabled or Supabase is not configured locally. */
export function isDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  // Default: demo only in local dev without Supabase
  return import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL;
}

export function isAppleAuthEnabled(): boolean {
  return import.meta.env.VITE_APPLE_AUTH_ENABLED === 'true';
}

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@rcconnect.app';
export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '+1 (469) 555-0100';
