import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '../types/auth';
import type { Profile } from '../types/database';
import { getAuthRedirectUrl, getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  authError: string | null;
  oauthCompleting: boolean;
  refreshProfile: () => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    phone: string;
    city: string;
    role: 'member' | 'business';
  }) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_INIT_TIMEOUT_MS = 15000;
const OAUTH_PENDING_KEY = 'rc_oauth_pending';

function profileToUser(profile: Profile, email?: string): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    email,
    city: profile.city,
    role: profile.role,
    avatarUrl: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    memberSince: profile.created_at,
  };
}

function userFromAuth(authUser: User): AuthUser {
  const meta = authUser.user_metadata ?? {};
  const role = meta.role === 'admin' || meta.role === 'business' ? meta.role : 'member';
  return {
    id: authUser.id,
    name: (meta.full_name as string) || (meta.name as string) || authUser.email?.split('@')[0] || 'Community Member',
    phone: (meta.phone as string) || '',
    email: authUser.email,
    city: (meta.city as string) || 'Royse City',
    role,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
  };
}

export function isOAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('code')) return true;
  const hash = window.location.hash;
  return hash.includes('access_token') || hash.includes('type=recovery');
}

function readOAuthError(): string | null {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error_description') || params.get('error');
  if (err) return decodeURIComponent(err.replace(/\+/g, ' '));
  const hash = window.location.hash;
  if (hash.includes('error=')) {
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    return hashParams.get('error_description') || hashParams.get('error');
  }
  return null;
}

function cleanOAuthUrl() {
  const url = new URL(window.location.href);
  for (const key of ['code', 'error', 'error_description', 'access_token', 'refresh_token', 'type']) {
    url.searchParams.delete(key);
  }
  if (url.hash.includes('access_token') || url.hash.includes('error') || url.hash.includes('type=recovery')) {
    url.hash = '#home';
  }
  if (!url.hash || url.hash === '#welcome' || url.hash === '#') {
    url.hash = '#home';
  }
  const clean = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + url.hash;
  window.history.replaceState({ stage: 'app', page: 'home', overlay: 'none', detail: null }, document.title, clean);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [oauthCompleting, setOauthCompleting] = useState(() => isOAuthCallback());
  const [authError, setAuthError] = useState<string | null>(() => readOAuthError());
  const sessionHandled = useRef(false);

  const loadProfile = useCallback(async (authUser: User): Promise<void> => {
    setUser(userFromAuth(authUser));

    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data && !error) {
        setUser(profileToUser(data, authUser.email));
        return;
      }

      for (let attempt = 0; attempt < 4; attempt++) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        if (retry) {
          setUser(profileToUser(retry, authUser.email));
          return;
        }
      }
    } catch (e) {
      console.error('[auth] profile load failed:', e);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setOauthCompleting(false);
      return;
    }

    const supabase = getSupabase();
    let mounted = true;
    sessionHandled.current = false;

    const finishAuth = () => {
      if (!mounted) return;
      setLoading(false);
      setOauthCompleting(false);
    };

    const handleSession = async (authUser: User) => {
      if (sessionHandled.current) return;
      sessionHandled.current = true;
      setOauthCompleting(true);
      await loadProfile(authUser);
      if (!mounted) return;
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      setAuthError(null);
      setOauthCompleting(false);
      setLoading(false);
      if (isOAuthCallback()) cleanOAuthUrl();
    };

    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      finishAuth();
    }, AUTH_INIT_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        void handleSession(session.user);
      } else if (event === 'INITIAL_SESSION' && !session) {
        if (!isOAuthCallback() && sessionStorage.getItem(OAUTH_PENDING_KEY) !== '1') {
          window.clearTimeout(timeout);
          finishAuth();
        }
      }
    });

    const initAuth = async () => {
      try {
        if (isOAuthCallback() || sessionStorage.getItem(OAUTH_PENDING_KEY) === '1') {
          setOauthCompleting(true);
        }

        // Let Supabase detectSessionInUrl process the ?code= first
        await new Promise((r) => setTimeout(r, 50));

        const maxAttempts = isOAuthCallback() ? 12 : 1;
        for (let i = 0; i < maxAttempts; i++) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) console.error('[auth] getSession:', error.message);
          if (session?.user) {
            await handleSession(session.user);
            window.clearTimeout(timeout);
            return;
          }
          if (!isOAuthCallback()) break;
          await new Promise((r) => setTimeout(r, 300));
        }

        if (!mounted || sessionHandled.current) return;

        if (isOAuthCallback()) {
          setAuthError('Google sign-in could not be completed. Please try again.');
        }
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        window.clearTimeout(timeout);
        finishAuth();
      } catch (e) {
        console.error('[auth] init failed:', e);
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        window.clearTimeout(timeout);
        finishAuth();
      }
    };

    void initAuth();

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp: AuthContextValue['signUp'] = async (input) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

    const { data, error } = await getSupabase().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
          phone: input.phone,
          city: input.city,
          role: input.role,
        },
      },
    });

    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return { error: 'Check your email to confirm your account before signing in.' };
    }
    if (data.user) await loadProfile(data.user);
    return {};
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) await loadProfile(data.user);
    return {};
  };

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

    const base = getAuthRedirectUrl();
    if (!base) {
      return { error: 'URL de redirection manquante. Configurez VITE_APP_URL et Supabase Site URL avec https://.' };
    }

    const redirectTo = `${base.replace(/\/$/, '')}/`;
    sessionStorage.setItem(OAUTH_PENDING_KEY, '1');

    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });

    if (error) sessionStorage.removeItem(OAUTH_PENDING_KEY);
    return error ? { error: error.message } : {};
  };

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
    const base = getAuthRedirectUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
    const redirectTo = `${base.replace(/\/$/, '')}/recovery`;
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    return error ? { error: error.message } : {};
  };

  const updatePassword: AuthContextValue['updatePassword'] = async (password) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
    const { error } = await getSupabase().auth.updateUser({ password });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    sessionHandled.current = false;
    if (isSupabaseConfigured) {
      await getSupabase().auth.signOut();
    }
    setUser(null);
  };

  const enterAsGuest = () => {
    setLoading(false);
    setOauthCompleting(false);
    setUser({
      name: 'Guest',
      phone: '',
      city: 'Royse City',
      role: 'member',
      guest: true,
    });
  };

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id || user.guest) return;
    const { data: { session } } = await getSupabase().auth.getSession();
    if (session?.user) await loadProfile(session.user);
  }, [loadProfile, user?.id, user?.guest]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      authError,
      oauthCompleting,
      refreshProfile,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updatePassword,
      signOut,
      enterAsGuest,
    }),
    [user, loading, authError, oauthCompleting, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
