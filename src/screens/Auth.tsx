import { useState } from 'react';
import { useT } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { LogoFull } from '../components/Logo';
import { ChevronLeft } from '../components/Icons';
import { isAppleAuthEnabled } from '../lib/config';

export type { AuthUser } from '../types/auth';

type AuthView = 'signin' | 'signup' | 'forgot' | 'recovery';

export function Auth({
  onSuccess,
  onBack,
  initialMode = 'signin',
  recoveryMode = false,
}: {
  onSuccess: () => void;
  onBack?: () => void;
  initialMode?: 'signin' | 'signup';
  recoveryMode?: boolean;
}) {
  const { t, lang, setLang } = useT();
  const { signUp, signIn, signInWithGoogle, resetPassword, updatePassword, enterAsGuest, isConfigured } = useAuth();
  const [view, setView] = useState<AuthView>(recoveryMode ? 'recovery' : initialMode);
  const [role, setRole] = useState<'member' | 'business'>('member');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Royse City, TX',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (!isConfigured && view !== 'forgot') {
        setError('Backend not configured. Copy .env.example to .env and add your Supabase keys.');
        return;
      }

      if (view === 'forgot') {
        if (!form.email) {
          setError('Email is required.');
          return;
        }
        const result = await resetPassword(form.email);
        if (result.error) {
          setError(result.error);
          return;
        }
        setInfo('Check your email for a password reset link.');
        return;
      }

      if (view === 'recovery') {
        if (form.newPassword.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }
        if (form.newPassword !== form.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const result = await updatePassword(form.newPassword);
        if (result.error) {
          setError(result.error);
          return;
        }
        onSuccess();
        return;
      }

      if (!form.email || !form.password) {
        setError('Email and password are required.');
        return;
      }

      if (view === 'signup' && form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      const result =
        view === 'signin'
          ? await signIn(form.email, form.password)
          : await signUp({
              email: form.email,
              password: form.password,
              name: form.name || 'Community Member',
              phone: form.phone,
              city: form.city.replace(', TX', '').trim() || 'Royse City',
              role,
            });

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    const result = await signInWithGoogle();
    setOauthLoading(false);
    if (result.error) setError(result.error);
  };

  const handleGuest = () => {
    enterAsGuest();
    onSuccess();
  };

  const title =
    view === 'forgot' ? t('forgotPassword') :
    view === 'recovery' ? 'Set new password' :
    view === 'signin' ? t('welcomeBack') : t('createAccount');

  const subtitle =
    view === 'forgot' ? 'Enter your email and we will send a reset link.' :
    view === 'recovery' ? 'Choose a new password for your account.' :
    view === 'signin' ? t('signInSubtitle') : t('signUpSubtitle');

  return (
    <div className="min-h-full bg-gradient-to-b from-navy via-navy-dark to-[#15294A] flex flex-col">
      <div className="relative px-5 pt-6 pb-16 text-center">
        {onBack && view !== 'recovery' && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-6 left-5 p-2 rounded-full bg-white/15 text-white"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="absolute top-6 right-5 flex items-center gap-1 text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full"
        >
          <span>{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span> {lang.toUpperCase()}
        </button>

        <div className="bg-white rounded-2xl p-4 inline-block shadow-xl mt-8 mb-4">
          <LogoFull height={72} />
        </div>
        <p className="text-white font-extrabold text-lg">{t('appName')}</p>
      </div>

      <div className="flex-1 bg-white rounded-t-[2rem] -mt-6 px-6 pt-8 pb-8 shadow-2xl animate-slide-up overflow-y-auto phone-scroll">
        <h2 className="text-2xl font-extrabold text-navy">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>

        {!isConfigured && view !== 'forgot' && (
          <div className="mt-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-2">
            Supabase not configured — guest mode still works.
          </div>
        )}

        {view !== 'forgot' && view !== 'recovery' && (
          <>
            <div className="mt-5 space-y-3">
              <SocialBtn
                icon={<GoogleIcon />}
                label={t('continueGoogle')}
                onClick={handleGoogle}
                disabled={oauthLoading || !isConfigured}
              />
              {isAppleAuthEnabled() && (
                <SocialBtn icon={<AppleIcon />} label={t('continueApple')} dark onClick={() => setError('Apple sign-in is not configured.')} />
              )}
            </div>

            <div className="flex items-center my-5 gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {view === 'signup' && (
            <AuthField
              label={t('fullName')}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Aminata Diallo"
            />
          )}
          {(view === 'signin' || view === 'signup' || view === 'forgot') && (
            <AuthField
              label={t('email')}
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
              placeholder="you@example.com"
            />
          )}
          {view === 'signup' && (
            <>
              <AuthField
                label={t('phone')}
                name="phone"
                autoComplete="tel"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                type="tel"
                placeholder="+1 469 555 0100"
              />
              <AuthField label={t('city')} name="city" autoComplete="address-level2" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Royse City, TX" />
            </>
          )}
          {(view === 'signin' || view === 'signup') && (
            <AuthField
              label={t('password')}
              name="password"
              autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              type="password"
              placeholder="••••••••"
            />
          )}
          {view === 'recovery' && (
            <>
              <AuthField
                label="New password"
                name="new-password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(v) => setForm({ ...form, newPassword: v })}
                type="password"
                placeholder="••••••••"
              />
              <AuthField
                label="Confirm password"
                name="confirm-password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(v) => setForm({ ...form, confirmPassword: v })}
                type="password"
                placeholder="••••••••"
              />
            </>
          )}

          {view === 'signup' && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{t('selectRole')}</div>
              <div className="grid grid-cols-2 gap-2">
                <RoleBtn label={t('roleMember')} emoji="👤" active={role === 'member'} onClick={() => setRole('member')} />
                <RoleBtn label={t('roleBusiness')} emoji="🏪" active={role === 'business'} onClick={() => setRole('business')} />
              </div>
            </div>
          )}

          {view === 'signin' && (
            <button
              type="button"
              onClick={() => { setView('forgot'); setError(null); setInfo(null); }}
              className="text-xs font-semibold text-crimson mt-1 block ml-auto"
            >
              {t('forgotPassword')}
            </button>
          )}

          {error && (
            <div className="mt-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2" role="alert">
              {error}
            </div>
          )}
          {info && (
            <div className="mt-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 bg-navy hover:bg-navy-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition"
          >
            {loading ? '…' :
              view === 'forgot' ? 'Send reset link' :
              view === 'recovery' ? 'Update password' :
              view === 'signin' ? t('signIn') : t('signUp')}
          </button>
        </form>

        {view === 'forgot' && (
          <button type="button" onClick={() => setView('signin')} className="w-full mt-4 text-crimson text-sm font-bold">
            ← Back to sign in
          </button>
        )}

        {(view === 'signin' || view === 'signup') && (
          <p className="text-center text-xs text-slate-500 mt-4">
            {view === 'signin' ? t('noAccount') : t('haveAccount')}{' '}
            <button
              type="button"
              onClick={() => { setView(view === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-crimson font-bold"
            >
              {view === 'signin' ? t('signUp') : t('signIn')}
            </button>
          </p>
        )}

        {(view === 'signin' || view === 'signup') && (
          <button
            type="button"
            onClick={handleGuest}
            className="w-full mt-4 text-slate-500 text-sm font-medium py-2"
          >
            {t('continueAsGuest')} →
          </button>
        )}
      </div>
    </div>
  );
}

function AuthField({
  label, name, value, onChange, type = 'text', placeholder, autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-navy outline-none text-sm text-slate-800"
      />
    </label>
  );
}

function SocialBtn({
  icon, label, onClick, dark, disabled,
}: { icon: React.ReactNode; label: string; onClick: () => void; dark?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm border transition active:scale-[0.98] disabled:opacity-50 ${
        dark
          ? 'bg-black text-white border-black'
          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.522 0-10-4.478-10-10s4.478-10 10-10c2.837 0 5.402 1.193 7.207 3.093l5.657-5.657C33.64 10.893 29.028 8 24 8 12.955 8 4 16.955 4 28s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c2.837 0 5.402 1.193 7.207 3.093l5.657-5.657C33.64 10.893 29.028 8 24 8 16.318 8 9.656 13.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 38.967 26.715 40 24 40c-5.067 0-9.42-3.227-10.966-7.743l-6.58 5.07C9.505 43.556 16.227 48 24 48z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 28c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 25 184.8 25 236.2c0 38.4 14.2 78.8 42.2 118.6 20.2 29.2 46.6 62.2 80.2 61.9 32.3-.3 44.8-20.5 84-20.5 38.5 0 49.2 20.5 83.6 20.2 34.8-.3 57.8-29.5 78-58.6 24.6-36.1 34.8-71.1 35.4-72.9-.8-.3-68.2-26.1-68.7-103.5zM259.3 94.7C280.1 70.9 293.3 38 288.9 0 260.4 1.1 227.2 18.9 209.5 42.7 192.8 64.9 181.6 98.2 186.5 129.1c30.2 2.3 61.8-15.3 72.8-34.4z" />
    </svg>
  );
}

function RoleBtn({ label, emoji, active, onClick }: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition ${
        active ? 'border-crimson bg-crimson/5' : 'border-slate-200 bg-white'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className={`text-[10px] font-bold leading-tight text-center px-1 ${active ? 'text-crimson' : 'text-slate-500'}`}>
        {label}
      </span>
    </button>
  );
}
