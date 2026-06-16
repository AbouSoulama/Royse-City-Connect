import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { MapPin, ChevronLeft, ChevronRight, StoreIcon, CalIcon, BriefIcon } from './Icons';
import type { Page } from './Layout';

export interface HeroSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  gradient: string;
  decor: string;
  page: Page;
}

export function HomeHero({
  userName,
  city,
  slides,
  onNavigate,
}: {
  userName: string;
  city: string;
  slides: HeroSlide[];
  onNavigate: (page: Page) => void;
}) {
  const { t } = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + slides.length) % slides.length);
      setPaused(true);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const slide = slides[index];

  return (
    <div className="bg-gradient-to-br from-navy via-navy-dark to-navy-light text-white px-4 pt-4 pb-5 rounded-b-3xl overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-4 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="text-white/60 text-xs font-medium">{t('welcomeBack')}</div>
          <div className="text-xl font-extrabold truncate">{userName} 👋</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl px-2.5 py-1.5 text-xs flex items-center gap-1 border border-white/10 shrink-0 max-w-[48%]">
          <MapPin size={14} className="text-crimson-light shrink-0" />
          <span className="font-semibold truncate">{city}</span>
        </div>
      </div>

      <div
        className="relative"
        onTouchStart={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          key={slide.id}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${slide.gradient} p-5 min-h-[168px] shadow-xl animate-hero-in`}
        >
          <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full border-2 border-white/15 ${slide.decor}`} />
          <div className={`absolute bottom-4 right-12 w-20 h-20 rounded-full border border-white/10 ${slide.decor}`} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 pr-8 min-w-0">
            {slide.badge && (
              <span className="inline-block bg-white text-[10px] font-extrabold uppercase tracking-wide text-slate-800 px-2.5 py-1 rounded-full mb-2 max-w-full truncate">
                {slide.badge}
              </span>
            )}
            <h2 className="text-lg font-extrabold leading-tight line-clamp-2">{slide.title}</h2>
            <p className="text-sm font-semibold text-white/90 mt-0.5 line-clamp-1">{slide.subtitle}</p>
            <p className="text-xs text-white/75 mt-2 leading-relaxed line-clamp-2">{slide.description}</p>
            <button
              onClick={() => onNavigate(slide.page)}
              className="mt-3 bg-white text-navy font-bold text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition inline-flex items-center gap-1"
            >
              {slide.cta} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white active:scale-90 transition z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white active:scale-90 transition z-20"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => { setIndex(i); setPaused(true); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4 min-w-0">
        <QuickAction icon={<StoreIcon size={20} />} label={t('businesses')} onClick={() => onNavigate('businesses')} />
        <QuickAction icon={<CalIcon size={20} />} label={t('events')} onClick={() => onNavigate('events')} />
        <QuickAction icon={<BriefIcon size={20} />} label={t('opportunities')} onClick={() => onNavigate('opportunities')} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white/10 backdrop-blur hover:bg-white/15 border border-white/15 rounded-2xl p-2.5 flex flex-col items-center gap-1 active:scale-95 transition min-w-0 w-full"
    >
      <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
        {icon}
      </span>
      <span className="text-[9px] font-bold text-white leading-[1.15] text-center line-clamp-2 w-full">{label}</span>
    </button>
  );
}

export function useHeroSlides(): HeroSlide[] {
  const { t } = useT();
  return [
    {
      id: 'welcome',
      badge: t('heroBadgeNew'),
      title: t('heroSlide1Title'),
      subtitle: t('heroSlide1Subtitle'),
      description: t('heroSlide1Desc'),
      cta: t('heroCta'),
      gradient: 'from-navy via-navy-light to-navy-dark',
      decor: 'opacity-40',
      page: 'news',
    },
    {
      id: 'businesses',
      badge: t('heroBadgeFeatured'),
      title: t('heroSlide2Title'),
      subtitle: t('heroSlide2Subtitle'),
      description: t('heroSlide2Desc'),
      cta: t('heroCtaBiz'),
      gradient: 'from-crimson via-crimson-dark to-rose-900',
      decor: 'opacity-30',
      page: 'businesses',
    },
    {
      id: 'events',
      title: t('heroSlide3Title'),
      subtitle: t('heroSlide3Subtitle'),
      description: t('heroSlide3Desc'),
      cta: t('heroCtaEvents'),
      gradient: 'from-navy-dark via-navy to-crimson-dark',
      decor: 'opacity-25',
      page: 'events',
    },
    {
      id: 'jobs',
      title: t('heroSlide4Title'),
      subtitle: t('heroSlide4Subtitle'),
      description: t('heroSlide4Desc'),
      cta: t('heroCtaJobs'),
      gradient: 'from-crimson-dark via-navy to-navy-dark',
      decor: 'opacity-30',
      page: 'opportunities',
    },
  ];
}
