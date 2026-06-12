import { useEffect, useMemo, useState } from 'react';
import { Lang, LangContext, translations, TKey } from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import { PhoneShell, Page, ModalSheet } from './components/Layout';
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

type Stage = 'welcome' | 'onboarding' | 'auth' | 'app';

function AppContent() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.id, user?.guest);
  const [lang, setLang] = useState<Lang>('en');
  const [stage, setStage] = useState<Stage>('welcome');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [page, setPage] = useState<Page>('home');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.guest) setStage('app');
  }, [loading, user]);

  const ctx = useMemo(
    () => ({ lang, setLang, t: (k: TKey) => translations[lang][k] }),
    [lang]
  );

  if (loading) {
    return (
      <LangContext.Provider value={ctx}>
        <PhoneShell page={page} setPage={setPage} onOpenNotifs={() => {}} onOpenProfile={() => {}} unreadCount={0} hideHeader hideNav>
          <div className="flex items-center justify-center min-h-full text-slate-400 text-sm">Loading…</div>
        </PhoneShell>
      </LangContext.Provider>
    );
  }

  const effectiveStage = user && !user.guest && stage !== 'welcome' && stage !== 'onboarding' ? 'app' : stage;

  const shellProps = {
    page,
    setPage,
    onOpenNotifs: () => {},
    onOpenProfile: () => {},
    unreadCount: 0,
    hideHeader: true as const,
    hideNav: true as const,
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
            onBack={() => setStage('welcome')}
            onSuccess={() => { setStage('app'); setPage('home'); }}
          />
        </PhoneShell>
      )}

      {effectiveStage === 'app' && user && (
        <PhoneShell
          page={page}
          setPage={setPage}
          onOpenNotifs={() => setNotifOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          unreadCount={unreadCount}
        >
          {adminOpen ? (
            <AdminDashboard onBack={() => setAdminOpen(false)} />
          ) : profileOpen ? (
            <Profile
              user={user}
              onBack={() => setProfileOpen(false)}
              onSignOut={async () => {
                await signOut();
                setProfileOpen(false);
                setStage('welcome');
              }}
              onOpenAdmin={() => { setProfileOpen(false); setAdminOpen(true); }}
              onOpenNotifs={() => { setProfileOpen(false); setNotifOpen(true); }}
              onOpenFeedback={() => { setProfileOpen(false); setFeedbackOpen(true); }}
              onProfileUpdated={refreshProfile}
              lang={lang}
              setLang={setLang}
            />
          ) : (
            <>
              {page === 'home' && <Home user={user} goTo={setPage} onOpenFeedback={() => setFeedbackOpen(true)} />}
              {page === 'news' && <News user={user} goTo={setPage} />}
              {page === 'businesses' && <Businesses user={user} />}
              {page === 'events' && <Events user={user} />}
              {page === 'opportunities' && <Opportunities user={user} />}
            </>
          )}

          <ModalSheet open={notifOpen} onClose={() => setNotifOpen(false)} title={ctx.t('notifTitle')}>
            <NotificationsList notifications={notifications} onClose={() => setNotifOpen(false)} onMarkAllRead={markAllRead} />
          </ModalSheet>

          <FeedbackSheet
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
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
      <AppContent />
    </AuthProvider>
  );
}
