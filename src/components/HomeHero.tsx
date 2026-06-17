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
    <div className="bg-gradient-to-br from-navy via-navy-dark to-navy-light text-white px-4 pt-4 pb-5 rounded-b-3xl w-full max-w-full overflow-hidden box-border">
      <div className="flex flex-col gap-2 mb-4 min-w-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-white/60 text-xs font-medium">{t('welcomeBack')}</div>
          <div className="text-lg font-extrabold truncate">{userName} 👋</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl px-2.5 py-1.5 text-xs inline-flex items-center gap-1 border border-white/10 self-start max-w-full">
          <MapPin size={14} className="text-crimson-light shrink-0" />
          <span className="font-semibold truncate">{city}</span>
        </div>
      </div>

      <div
        className="relative w-full max-w-full"
        onTouchStart={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          key={slide.id}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${slide.gradient} px-4 py-5 min-h-[168px] shadow-xl animate-hero-in w-full box-border`}
        >
          <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full border-2 border-white/15 pointer-events-none ${slide.decor}`} />
          <div className={`absolute bottom-4 right-12 w-20 h-20 rounded-full border border-white/10 pointer-events-none ${slide.decor}`} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 min-w-0">
            {slide.badge && (
              <span className="inline-block bg-white text-[10px] font-extrabold uppercase tracking-wide text-slate-800 px-2.5 py-1 rounded-full mb-2 max-w-full truncate">
                {slide.badge}
              </span>
            )}
            <h2 className="text-base font-extrabold leading-tight line-clamp-2">{slide.title}</h2>
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
          <div className="flex items-center justify-center gap-3 mt-3 w-full">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white active:scale-90 transition shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex justify-center gap-1.5 flex-1">
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
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/25 flex items-center justify-center text-white active:scale-90 transition shrink-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 mt-4 w-full max-w-full min-w-0">
        <QuickAction icon={<StoreIcon size={18} />} label={t('businesses')} onClick={() => onNavigate('businesses')} />
        <QuickAction icon={<CalIcon size={18} />} label={t('events')} onClick={() => onNavigate('events')} />
        <QuickAction icon={<BriefIcon size={18} />} label={t('opportunities')} onClick={() => onNavigate('opportunities')} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-0 bg-white/10 backdrop-blur hover:bg-white/15 border border-white/15 rounded-2xl p-2 flex flex-col items-center gap-1 active:scale-95 transition"
    >
      <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
        {icon}
      </span>
      <span className="text-[8px] font-bold text-white leading-[1.1] text-center line-clamp-2 w-full">{label}</span>
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
