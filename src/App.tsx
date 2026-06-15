import { useEffect, useMemo, useState } from 'react';
import { Lang, LangContext, translations, TKey } from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { useNotifications } from './hooks/useNotifications';
import { PhoneShell, ModalSheet } from './components/Layout';
import { Welcome, Onboarding } from './screens/Onboarding';
import { Auth } from './screens/Auth';
import { Home } from './screens/Home';
import { News } from './screens/News';
import { Businesses } from './screens/Businesses';
import { Events } from './screens/Events';
import { Opportunities } from './screens/Opportunities';
import { Profile } from './screens/Profile';
import { NotificationsList } from './screens/Notifications';
import { AdminDashboard } from './screens/Admin';
import { FeedbackSheet } from './components/FeedbackSheet';
import { touchLastSeen } from './services/admin';

const LANG_KEY = 'rc_lang';

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

function AppContent() {
  const { user, loading, signOut, refreshProfile, authError, oauthCompleting } = useAuth();
  const nav = useNavigation();
  const { stage, page, overlay, authMode, setStage, setPage, setOverlay, setAuthMode } = nav;
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.id, user?.guest);
  const [lang, setLangState] = useState<Lang>(readLang);
  const [recoveryMode] = useState(() => window.location.pathname === '/recovery' || window.location.hash.includes('type=recovery'));

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Utilisateur connecté → toujours l'app (évite retour welcome après Google OAuth)
  useEffect(() => {
    if (!loading && user && !user.guest) {
      setStage('app', true);
      setPage('home');
      touchLastSeen();
    }
  }, [loading, user, setStage, setPage]);

  const ctx = useMemo(
    () => ({ lang, setLang, t: (k: TKey) => translations[lang][k] }),
    [lang]
  );

  if (loading || oauthCompleting) {
    return (
      <LangContext.Provider value={ctx}>
        <PhoneShell page={page} setPage={setPage} onOpenNotifs={() => {}} onOpenProfile={() => {}} unreadCount={0} hideHeader hideNav>
          <div className="flex flex-col items-center justify-center min-h-full text-slate-500 text-sm gap-3 p-6">
            <div className="w-10 h-10 rounded-full border-2 border-navy border-t-transparent animate-spin" />
            <p>{oauthCompleting ? (lang === 'fr' ? 'Connexion Google en cours…' : 'Signing in with Google…') : (lang === 'fr' ? 'Chargement…' : 'Loading…')}</p>
          </div>
        </PhoneShell>
      </LangContext.Provider>
    );
  }

  if (recoveryMode && !user?.guest) {
    return (
      <LangContext.Provider value={ctx}>
        <PhoneShell page={page} setPage={setPage} onOpenNotifs={() => {}} onOpenProfile={() => {}} unreadCount={0} hideHeader hideNav>
          <Auth
            recoveryMode
            onSuccess={() => {
              window.history.replaceState(null, '', '/#home');
              setStage('app', true);
              setPage('home');
            }}
          />
        </PhoneShell>
      </LangContext.Provider>
    );
  }

  const effectiveStage = user && !user.guest ? 'app' : stage;

  const shellProps = {
    page,
    setPage,
    onOpenNotifs: () => {},
    onOpenProfile: () => {},
    unreadCount: 0,
    hideHeader: true as const,
    hideNav: true as const,
    fillScreen: true as const,
  };

  return (
    <LangContext.Provider value={ctx}>
      {effectiveStage === 'welcome' && (
        <PhoneShell {...shellProps}>
          <Welcome
            onGetStarted={() => setStage('onboarding')}
            onSignIn={() => { setAuthMode('signin'); setStage('auth'); }}
          />
        </PhoneShell>
      )}

      {effectiveStage === 'onboarding' && (
        <PhoneShell {...shellProps}>
          <Onboarding onDone={() => { setAuthMode('signup'); setStage('auth'); }} />
        </PhoneShell>
      )}

      {effectiveStage === 'auth' && (
        <PhoneShell {...shellProps}>
          <Auth
            initialMode={authMode}
            initialError={authError}
            onBack={() => setStage('welcome')}
            onSuccess={() => { setStage('app', true); setPage('home'); }}
          />
        </PhoneShell>
      )}

      {effectiveStage === 'app' && user && (
        <PhoneShell
          page={page}
          setPage={setPage}
          onOpenNotifs={() => setOverlay('notif')}
          onOpenProfile={() => setOverlay('profile')}
          unreadCount={unreadCount}
        >
          {overlay === 'admin' && user.role === 'admin' ? (
            <AdminDashboard onBack={() => setOverlay('none')} />
          ) : overlay === 'profile' ? (
            <Profile
              user={user}
              onBack={() => setOverlay('none')}
              onSignOut={async () => {
                await signOut();
                setOverlay('none');
                setStage('welcome', true);
              }}
              onOpenAdmin={() => {
                if (user.role === 'admin') setOverlay('admin');
              }}
              onOpenNotifs={() => setOverlay('notif')}
              onOpenFeedback={() => setOverlay('feedback')}
              onProfileUpdated={refreshProfile}
              lang={lang}
              setLang={setLang}
            />
          ) : (
            <>
              {page === 'home' && <Home user={user} goTo={setPage} onOpenFeedback={() => setOverlay('feedback')} />}
              {page === 'news' && <News user={user} goTo={setPage} />}
              {page === 'businesses' && <Businesses user={user} />}
              {page === 'events' && <Events user={user} />}
              {page === 'opportunities' && <Opportunities user={user} />}
            </>
          )}

          <ModalSheet open={overlay === 'notif'} onClose={() => setOverlay('none')} title={ctx.t('notifTitle')}>
            <NotificationsList notifications={notifications} onClose={() => setOverlay('none')} onMarkAllRead={markAllRead} />
          </ModalSheet>

          <FeedbackSheet
            open={overlay === 'feedback'}
            onClose={() => setOverlay('none')}
            userId={user.guest ? undefined : user.id}
            userName={user.name}
          />
        </PhoneShell>
      )}
    </LangContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
