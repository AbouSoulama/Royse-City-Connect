import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { heroBackgrounds } from '../data/heroImages';
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
  image: string;
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
    }, 6000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  useEffect(() => {
    const img = new Image();
    img.src = slides[index].image;
    const next = slides[(index + 1) % slides.length];
    if (next) {
      const preload = new Image();
      preload.src = next.image;
    }
  }, [index, slides]);

  const slide = slides[index];

  return (
    <div className="relative bg-gradient-to-br from-navy via-navy-dark to-navy-light text-white px-4 pt-5 pb-6 rounded-b-[2rem] w-full max-w-full overflow-hidden box-border">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-crimson/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-navy-light/20 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col gap-2.5 mb-5 min-w-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-white/55 text-[10px] font-bold tracking-[0.12em] uppercase">{t('welcomeBack')}</div>
          <div className="text-2xl font-black truncate tracking-tight mt-0.5">{userName}</div>
        </div>
        <div className="bg-white/12 rounded-2xl px-3 py-1.5 text-xs inline-flex items-center gap-1.5 border border-white/15 self-start max-w-full">
          <MapPin size={13} className="text-crimson-light shrink-0" />
          <span className="font-bold truncate">{city}</span>
        </div>
      </div>

      <div
        className="relative w-full max-w-full"
        onTouchStart={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] min-h-[230px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full box-border">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`hero-slide ${i === index ? 'active' : ''}`}
              aria-hidden={i !== index}
            >
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 w-full h-full img-hd"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'auto'}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-75`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
          ))}

          <div className="relative z-10 px-5 py-6 min-w-0 animate-hero-in">
            {slide.badge && (
              <span className="inline-block bg-white text-[10px] font-extrabold uppercase tracking-wider text-navy px-3 py-1 rounded-full mb-2.5 max-w-full truncate shadow-md">
                {slide.badge}
              </span>
            )}
            <h2 className="text-xl font-black leading-tight line-clamp-2 drop-shadow-lg tracking-tight">{slide.title}</h2>
            <p className="text-sm font-bold text-white/95 mt-1.5 line-clamp-1">{slide.subtitle}</p>
            <p className="text-xs text-white/80 mt-2 leading-relaxed line-clamp-2">{slide.description}</p>
            <button
              type="button"
              onClick={() => onNavigate(slide.page)}
              className="mt-5 bg-white text-navy font-extrabold text-xs px-5 py-3 rounded-full shadow-xl tap-scale inline-flex items-center gap-1.5"
            >
              {slide.cta} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3.5 w-full">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white tap-scale shrink-0"
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
                    i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/35'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white tap-scale shrink-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex gap-2.5 mt-5 w-full max-w-full min-w-0">
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
      className="flex-1 min-w-0 bg-white/10 hover:bg-white/18 border border-white/20 rounded-2xl p-3 flex flex-col items-center gap-2 tap-scale"
    >
      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/25 to-white/10 flex items-center justify-center text-white shrink-0">
        {icon}
      </span>
      <span className="text-[9px] font-extrabold text-white leading-[1.1] text-center line-clamp-2 w-full uppercase tracking-wide">{label}</span>
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
      gradient: 'from-navy/90 via-navy-light/80 to-navy-dark/90',
      image: heroBackgrounds.welcome,
      page: 'news',
    },
    {
      id: 'businesses',
      badge: t('heroBadgeFeatured'),
      title: t('heroSlide2Title'),
      subtitle: t('heroSlide2Subtitle'),
      description: t('heroSlide2Desc'),
      cta: t('heroCtaBiz'),
      gradient: 'from-crimson/90 via-crimson-dark/80 to-rose-900/90',
      image: heroBackgrounds.businesses,
      page: 'businesses',
    },
    {
      id: 'events',
      title: t('heroSlide3Title'),
      subtitle: t('heroSlide3Subtitle'),
      description: t('heroSlide3Desc'),
      cta: t('heroCtaEvents'),
      gradient: 'from-navy-dark/90 via-navy/80 to-crimson-dark/90',
      image: heroBackgrounds.events,
      page: 'events',
    },
    {
      id: 'jobs',
      title: t('heroSlide4Title'),
      subtitle: t('heroSlide4Subtitle'),
      description: t('heroSlide4Desc'),
      cta: t('heroCtaJobs'),
      gradient: 'from-crimson-dark/90 via-navy/80 to-navy-dark/90',
      image: heroBackgrounds.jobs,
      page: 'opportunities',
    },
  ];
}
