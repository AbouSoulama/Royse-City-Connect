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
    <div className="app-viewport fixed inset-0 w-full max-w-full overflow-hidden bg-white md:bg-slate-200 md:bg-pattern flex flex-col md:items-center md:justify-center md:p-6">
      <div className="app-frame flex flex-col flex-1 min-h-0 w-full max-w-full md:flex-none md:w-[420px] md:max-w-[420px] md:h-[min(860px,calc(100dvh-3rem))] md:max-h-[calc(100dvh-3rem)] md:rounded-[42px] md:shadow-2xl md:border-[10px] md:border-slate-900 relative md:phone-glow">
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-slate-700 mr-2" />
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {!hideHeader && (
          <header className="shrink-0 bg-white/97 border-b border-slate-100/80 px-3 pt-3 pb-2.5 flex items-center justify-between relative z-10 gap-1.5 min-w-0 shadow-[0_1px_12px_rgba(30,58,95,0.04)]">
            <button type="button" onClick={() => setPage('home')} className="flex items-center min-w-0 flex-1 max-w-[45%] tap-scale">
              <LogoHeader height={34} />
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy text-xs font-extrabold"
                >
                  <GlobeIcon size={14} />
                  <span className="uppercase">{lang}</span>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 w-32 animate-fade-in">
                      <button type="button" onClick={() => { setLang('en'); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'en' ? 'text-navy font-semibold' : 'text-slate-700'}`}>
                        🇺🇸 English
                      </button>
                      <button type="button" onClick={() => { setLang('fr'); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'fr' ? 'text-navy font-semibold' : 'text-slate-700'}`}>
                        🇫🇷 Français
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button type="button" onClick={onOpenNotifs} className="relative p-2 rounded-full hover:bg-slate-100 text-navy" aria-label={t('notifications')}>
                <BellIcon size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-crimson text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button type="button" onClick={onOpenProfile} className="p-2 rounded-full hover:bg-slate-100 text-navy" aria-label={t('profile')}>
                <UserIcon size={20} />
              </button>
            </div>
          </header>
        )}

        <main
          className={`flex flex-col ${
            fillScreen ? 'flex-1 min-h-0 min-w-0 overflow-hidden' : 'app-scroll phone-scroll bg-slate-50'
          }`}
        >
          {children}
        </main>

        {!hideNav && (
          <nav className="shrink-0 z-20 nav-modern px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] grid grid-cols-5 gap-0 w-full max-w-full min-w-0">
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
      className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl min-w-0 w-full tap-scale ${
        active ? 'text-crimson' : 'text-slate-400 hover:text-navy'
      }`}
    >
      <div className={`shrink-0 p-1 rounded-xl ${active ? 'nav-btn-active' : ''}`}>{icon}</div>
      <span className={`text-[8px] leading-[1.1] text-center line-clamp-2 w-full ${active ? 'font-extrabold' : 'font-medium'}`}>{label}</span>
    </button>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 mt-6 mb-2.5 min-w-0 max-w-full">
      <h2 className="text-sm font-black text-navy min-w-0 flex-1 leading-snug truncate section-accent">{title}</h2>
      {action && <div className="shrink-0 max-w-[38%]">{action}</div>}
    </div>
  );
}

export function LoadingScreen({ message }: { message: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-white"
      style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #15294A 100%)' }}
    >
      <div className="w-11 h-11 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
      <p className="text-sm font-medium text-white/90 text-center">{message}</p>
    </div>
  );
}

export function ModalSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[85dvh] flex flex-col animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100 shrink-0 min-w-0">
          <h3 className="font-extrabold text-navy min-w-0 flex-1 truncate">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 shrink-0">
            <XIcon size={20} />
          </button>
        </div>
        <div className="overflow-y-auto phone-scroll flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
