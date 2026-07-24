import { ReactNode, useState } from 'react';
import { useT } from '../i18n';
import { LogoHeader } from './Logo';
import {
  HomeIcon, StoreIcon, CalIcon, BriefIcon, NewsIcon,
  BellIcon, GlobeIcon, UserIcon, XIcon
} from './Icons';

export type Page = 'home' | 'news' | 'businesses' | 'events' | 'opportunities';

interface PhoneShellProps {
  children: ReactNode;
  page: Page;
  setPage: (p: Page) => void;
  onOpenNotifs: () => void;
  onOpenProfile: () => void;
  unreadCount: number;
  hideNav?: boolean;
  hideHeader?: boolean;
  /** Full-bleed screens (welcome, auth, loading) */
  fillScreen?: boolean;
}

export function PhoneShell({
  children, page, setPage, onOpenNotifs, onOpenProfile, unreadCount, hideNav, hideHeader, fillScreen,
}: PhoneShellProps) {
  const { lang, setLang, t } = useT();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="app-viewport fixed inset-0 w-full max-w-full overflow-hidden bg-white md:bg-[#dce3ee] md:bg-pattern flex flex-col md:items-center md:justify-center md:p-6">
      <div className="app-frame flex flex-col flex-1 min-h-0 w-full max-w-full md:flex-none md:w-[420px] md:max-w-[420px] md:h-[min(860px,calc(100dvh-3rem))] md:max-h-[calc(100dvh-3rem)] md:rounded-[42px] md:shadow-2xl md:border-[10px] md:border-slate-900 relative md:phone-glow md:overflow-hidden">
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-slate-700 mr-2" />
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {!hideHeader && (
          <header className="shrink-0 page-header px-3 pt-3 pb-2.5 flex items-center justify-between relative z-10 gap-1.5 min-w-0">
            <button type="button" onClick={() => setPage('home')} className="flex items-center min-w-0 flex-1 max-w-[45%] tap-scale">
              <LogoHeader height={34} />
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-navy/[0.06] hover:bg-navy/[0.1] text-navy text-xs font-extrabold transition-colors"
                >
                  <GlobeIcon size={14} />
                  <span className="uppercase tracking-wide">{lang}</span>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 bg-white/95 backdrop-blur-xl border border-navy/10 rounded-2xl shadow-xl py-1.5 z-50 w-36 animate-fade-in overflow-hidden">
                      <button type="button" onClick={() => { setLang('en'); setLangOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${lang === 'en' ? 'text-crimson font-bold bg-crimson/[0.06]' : 'text-navy hover:bg-slate-50'}`}>
                        English
                      </button>
                      <button type="button" onClick={() => { setLang('fr'); setLangOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${lang === 'fr' ? 'text-crimson font-bold bg-crimson/[0.06]' : 'text-navy hover:bg-slate-50'}`}>
                        Français
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button type="button" onClick={onOpenNotifs} className="relative p-2 rounded-full hover:bg-navy/[0.06] text-navy transition-colors" aria-label={t('notifications')}>
                <BellIcon size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-crimson text-white text-[9px] font-bold flex items-center justify-center shadow-sm pulse-dot">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button type="button" onClick={onOpenProfile} className="p-2 rounded-full hover:bg-navy/[0.06] text-navy transition-colors" aria-label={t('profile')}>
                <UserIcon size={20} />
              </button>
            </div>
          </header>
        )}

        <main
          className={`flex flex-col ${
            fillScreen ? 'flex-1 min-h-0 min-w-0 overflow-hidden' : 'app-scroll phone-scroll'
          }`}
        >
          {children}
        </main>

        {!hideNav && (
          <nav className="shrink-0 z-20 nav-modern px-1.5 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom,0px))] grid grid-cols-5 gap-0 w-full max-w-full min-w-0">
            <NavBtn icon={<HomeIcon size={20} />} label={t('home')} active={page === 'home'} onClick={() => setPage('home')} />
            <NavBtn icon={<NewsIcon size={20} />} label={t('news')} active={page === 'news'} onClick={() => setPage('news')} />
            <NavBtn icon={<StoreIcon size={20} />} label={t('businesses')} active={page === 'businesses'} onClick={() => setPage('businesses')} />
            <NavBtn icon={<CalIcon size={20} />} label={t('events')} active={page === 'events'} onClick={() => setPage('events')} />
            <NavBtn icon={<BriefIcon size={20} />} label={t('opportunities')} active={page === 'opportunities'} onClick={() => setPage('opportunities')} />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-2xl min-w-0 w-full tap-scale transition-colors duration-200 ${
        active ? 'text-crimson' : 'text-slate-400 hover:text-navy'
      }`}
    >
      {active && (
        <span className="absolute -top-[7px] left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-gradient-to-r from-crimson to-crimson-dark animate-nav-glow" />
      )}
      <div className={`shrink-0 p-1.5 rounded-xl transition-all duration-200 ${active ? 'nav-btn-active animate-nav-glow' : ''}`}>{icon}</div>
      <span className={`text-[8px] leading-[1.1] text-center line-clamp-2 w-full tracking-wide transition-all ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 mt-7 mb-3 min-w-0 max-w-full">
      <h2 className="text-[0.95rem] font-extrabold text-navy min-w-0 flex-1 leading-snug truncate section-accent">{title}</h2>
      {action && <div className="shrink-0 max-w-[38%]">{action}</div>}
    </div>
  );
}

/** Skeleton placeholder rows for list screens (premium loading state). */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex gap-3">
          <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 py-1">
            <div className="skeleton h-3.5 w-2/3 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-white welcome-mesh relative overflow-hidden">
      <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-40" />
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-[3px] border-white/20 border-t-crimson-light animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-white/10 border-b-white/40" style={{ animation: 'spinSlow 1.6s linear infinite reverse' }} />
      </div>
      <p className="text-sm font-semibold text-white/90 text-center tracking-wide animate-fade-in">{message}</p>
    </div>
  );
}

export function ModalSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end animate-fade-in">
      <div className="absolute inset-0 bg-navy-dark/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-[1.75rem] max-h-[85dvh] flex flex-col animate-slide-up overflow-hidden shadow-2xl">
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-200 shrink-0" />
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-3 border-b border-slate-100/80 shrink-0 min-w-0">
          <h3 className="font-extrabold text-navy min-w-0 flex-1 truncate font-display text-lg">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 shrink-0 transition-colors">
            <XIcon size={20} />
          </button>
        </div>
        <div className="overflow-y-auto phone-scroll flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
