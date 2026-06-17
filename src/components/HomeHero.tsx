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
  const [imgReady, setImgReady] = useState(true);

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
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, [slides]);

  useEffect(() => {
    setImgReady(false);
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true);
    img.src = slides[index].image;
  }, [index, slides]);

  const slide = slides[index];

  return (
    <div className="relative bg-gradient-to-br from-navy via-navy-dark to-navy-light text-white px-4 pt-4 pb-5 rounded-b-[1.75rem] w-full max-w-full overflow-hidden box-border">
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      <div className="relative flex flex-col gap-2 mb-4 min-w-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-white/60 text-xs font-medium tracking-wide uppercase">{t('welcomeBack')}</div>
          <div className="text-xl font-extrabold truncate">{userName} 👋</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-2.5 py-1.5 text-xs inline-flex items-center gap-1 border border-white/15 self-start max-w-full">
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
          className={`relative overflow-hidden rounded-3xl min-h-[210px] shadow-2xl w-full box-border transition-opacity duration-300 ${imgReady ? 'opacity-100' : 'opacity-90'}`}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover img-content scale-105"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

          <div className="relative z-10 px-4 py-5 min-w-0">
            {slide.badge && (
              <span className="inline-block bg-white/95 backdrop-blur text-[10px] font-extrabold uppercase tracking-wide text-navy px-2.5 py-1 rounded-full mb-2 max-w-full truncate shadow-sm">
                {slide.badge}
              </span>
            )}
            <h2 className="text-lg font-extrabold leading-tight line-clamp-2 drop-shadow-sm">{slide.title}</h2>
            <p className="text-sm font-semibold text-white/95 mt-1 line-clamp-1 drop-shadow-sm">{slide.subtitle}</p>
            <p className="text-xs text-white/85 mt-2 leading-relaxed line-clamp-2">{slide.description}</p>
            <button
              type="button"
              onClick={() => onNavigate(slide.page)}
              className="mt-4 bg-white text-navy font-bold text-xs px-4 py-2.5 rounded-full shadow-lg active:scale-95 transition inline-flex items-center gap-1"
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
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-90 transition shrink-0"
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
                    i === index ? 'w-7 bg-white shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-90 transition shrink-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex gap-2 mt-4 w-full max-w-full min-w-0">
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
      className="flex-1 min-w-0 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition shadow-sm"
    >
      <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
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
