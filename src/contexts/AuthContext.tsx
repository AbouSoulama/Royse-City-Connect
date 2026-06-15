import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

const AUTH_INIT_TIMEOUT_MS = 12000;
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
  let dirty = false;
  for (const key of ['code', 'error', 'error_description', 'access_token', 'refresh_token', 'type']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      dirty = true;
    }
  }
  if (url.hash.includes('access_token') || url.hash.includes('error') || url.hash.includes('type=recovery')) {
    url.hash = '#home';
    dirty = true;
  }
  if (dirty || !url.hash || url.hash === '#welcome' || url.hash === '#') {
    url.hash = '#home';
    dirty = true;
  }
  if (dirty) {
    const clean = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + url.hash;
    window.history.replaceState({ stage: 'app', page: 'home', overlay: 'none', detail: null }, document.title, clean);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [oauthCompleting, setOauthCompleting] = useState(() => isOAuthCallback() || sessionStorage.getItem(OAUTH_PENDING_KEY) === '1');
  const [authError, setAuthError] = useState<string | null>(() => readOAuthError());

  const loadProfile = useCallback(async (authUser: User): Promise<void> => {
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

      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        if (retry) {
          setUser(profileToUser(retry, authUser.email));
          return;
        }
      }
    } catch (e) {
      console.error('[auth] profile load failed:', e);
    }

    setUser(userFromAuth(authUser));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setOauthCompleting(false);
      return;
    }

    const supabase = getSupabase();
    let mounted = true;

    const oauthFlow = isOAuthCallback() || sessionStorage.getItem(OAUTH_PENDING_KEY) === '1';

    const finishLoading = (force = false) => {
      if (!mounted) return;
      if (!force && oauthFlow && !authError) {
        // Keep spinner until profile is loaded or OAuth fails
        return;
      }
      setLoading(false);
      setOauthCompleting(false);
    };

    const timeout = window.setTimeout(() => finishLoading(true), AUTH_INIT_TIMEOUT_MS);

    const handleSession = async (authUser: User, event: string) => {
      await loadProfile(authUser);
      if (!mounted) return;
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      setOauthCompleting(false);
      setAuthError(null);
      setLoading(false);
      if (event === 'SIGNED_IN' || isOAuthCallback()) {
        cleanOAuthUrl();
      }
      window.clearTimeout(timeout);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        void handleSession(session.user, event);
      } else if (!session) {
        const pending = sessionStorage.getItem(OAUTH_PENDING_KEY) === '1' || isOAuthCallback();
        if (pending && (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT')) {
          return;
        }
        setUser((prev) => (prev?.guest ? prev : null));
        if (event === 'INITIAL_SESSION' && !pending) {
          window.clearTimeout(timeout);
          finishLoading(true);
        }
      }
    });

    const initAuth = async () => {
      try {
        if (isOAuthCallback()) {
          setOauthCompleting(true);
        }

        // detectSessionInUrl exchanges ?code= — retry getSession while OAuth finishes
        let session = null;
        const attempts = isOAuthCallback() ? 8 : 1;
        for (let i = 0; i < attempts; i++) {
          const { data, error } = await supabase.auth.getSession();
          if (error) console.error('[auth] getSession:', error.message);
          session = data.session;
          if (session?.user) break;
          if (isOAuthCallback() && i < attempts - 1) {
            await new Promise((r) => setTimeout(r, 350));
          }
        }

        if (mounted && session?.user) {
          await handleSession(session.user, 'INITIAL_SESSION');
        } else if (mounted && isOAuthCallback()) {
          setAuthError('Google sign-in could not be completed. Please try again.');
          sessionStorage.removeItem(OAUTH_PENDING_KEY);
          setOauthCompleting(false);
          setLoading(false);
          window.clearTimeout(timeout);
        } else if (mounted && oauthFlow && !isOAuthCallback()) {
          sessionStorage.removeItem(OAUTH_PENDING_KEY);
          finishLoading(true);
        } else if (mounted && !oauthFlow) {
          window.clearTimeout(timeout);
          finishLoading(true);
        }
      } catch (e) {
        console.error('[auth] init failed:', e);
        if (mounted) {
          setOauthCompleting(false);
          setLoading(false);
        }
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

    const redirectTo = `${base.replace(/\/$/, '')}/#home`;
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
