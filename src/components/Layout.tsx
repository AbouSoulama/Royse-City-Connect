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
}

export function PhoneShell({
  children, page, setPage, onOpenNotifs, onOpenProfile, unreadCount, hideNav, hideHeader,
}: PhoneShellProps) {
  const { lang, setLang, t } = useT();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-hidden bg-slate-200 bg-pattern flex items-stretch md:items-center justify-center md:p-6">
      <div className="w-full min-h-screen min-h-[100dvh] md:w-[420px] md:h-[860px] md:min-h-0 md:max-h-[calc(100dvh-3rem)] bg-white md:rounded-[42px] md:shadow-2xl md:border-[10px] md:border-slate-900 relative overflow-hidden flex flex-col">
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-slate-700 mr-2" />
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {!hideHeader && (
          <header className="shrink-0 bg-white border-b border-slate-100 px-3 pt-6 md:pt-8 pb-2.5 flex items-center justify-between relative z-10 gap-2">
            <button onClick={() => setPage('home')} className="flex items-center min-w-0 active:opacity-70">
              <LogoHeader height={34} />
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy text-xs font-bold"
                >
                  <GlobeIcon size={14} />
                  <span className="uppercase">{lang}</span>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 w-32 animate-fade-in">
                      <button onClick={() => { setLang('en'); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'en' ? 'text-navy font-semibold' : 'text-slate-700'}`}>
                        🇺🇸 English
                      </button>
                      <button onClick={() => { setLang('fr'); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'fr' ? 'text-navy font-semibold' : 'text-slate-700'}`}>
                        🇫🇷 Français
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button onClick={onOpenNotifs} className="relative p-2 rounded-full hover:bg-slate-100 text-navy" aria-label={t('notifications')}>
                <BellIcon size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-crimson text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button onClick={onOpenProfile} className="p-2 rounded-full hover:bg-slate-100 text-navy" aria-label={t('profile')}>
                <UserIcon size={20} />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto phone-scroll bg-slate-50 min-h-0">
          {children}
        </main>

        {!hideNav && (
          <nav className="shrink-0 z-20 bg-white border-t border-slate-200 px-1 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] grid grid-cols-5 gap-0.5">
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
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${
        active ? 'text-crimson' : 'text-slate-400 hover:text-navy'
      }`}
    >
      <div className={active ? 'scale-110' : ''}>{icon}</div>
      <span className={`text-[9px] leading-tight text-center ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      {active && <span className="w-1 h-1 rounded-full bg-crimson -mt-0.5" />}
    </button>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 mt-5 mb-2">
      <h2 className="text-base font-extrabold text-navy">{title}</h2>
      {action}
    </div>
  );
}

export function ModalSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[85%] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-navy">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
            <XIcon size={20} />
          </button>
        </div>
        <div className="overflow-y-auto phone-scroll flex-1">{children}</div>
      </div>
    </div>
  );
}
