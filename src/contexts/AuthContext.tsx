import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '../types/auth';
import type { Profile } from '../types/database';
import { getAuthRedirectUrl, getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
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
  return {
    id: authUser.id,
    name: (meta.full_name as string) || (meta.name as string) || authUser.email?.split('@')[0] || 'Community Member',
    phone: (meta.phone as string) || '',
    email: authUser.email,
    city: (meta.city as string) || 'Royse City',
    role: 'member',
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
  };
}

function cleanOAuthUrl() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('code') || url.hash.includes('access_token')) {
    url.searchParams.delete('code');
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');
    const clean = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '');
    window.history.replaceState({}, document.title, clean || '/');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadProfile = useCallback(async (authUser: User): Promise<boolean> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data && !error) {
      setUser(profileToUser(data, authUser.email));
      return true;
    }

    // Profile row may lag behind OAuth trigger — retry briefly
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      const { data: retry } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (retry) {
        setUser(profileToUser(retry, authUser.email));
        return true;
      }
    }

    // Fallback so Google sign-in still works if profile trigger is delayed/missing
    setUser(userFromAuth(authUser));
    return false;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    const init = async () => {
      // PKCE: exchange ?code= from Google redirect (production on Vercel)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('OAuth code exchange failed:', error.message);
        }
        cleanOAuthUrl();
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadProfile(session.user);
        if (event === 'SIGNED_IN') {
          cleanOAuthUrl();
        }
      } else {
        setUser((prev) => (prev?.guest ? prev : null));
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp: AuthContextValue['signUp'] = async (input) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured' };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
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

    if (data.user) {
      await loadProfile(data.user);
    }

    return {};
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured' };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    if (data.user) {
      await loadProfile(data.user);
    }

    return {};
  };

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured' };
    }

    const redirectTo = getAuthRedirectUrl();
    if (!redirectTo) {
      return { error: 'Could not determine redirect URL.' };
    }

    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });

    return error ? { error: error.message } : {};
  };

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
    const redirectTo = `${window.location.origin}/recovery`;
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    return error ? { error: error.message } : {};
  };

  const updatePassword: AuthContextValue['updatePassword'] = async (password) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
    const { error } = await getSupabase().auth.updateUser({ password });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await getSupabase().auth.signOut();
    }
    setUser(null);
  };

  const enterAsGuest = () => {
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
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadProfile(session.user);
    }
  }, [loadProfile, user?.id, user?.guest]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      refreshProfile,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updatePassword,
      signOut,
      enterAsGuest,
    }),
    [user, loading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
