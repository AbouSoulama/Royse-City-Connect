import { useT } from '../i18n';
import { Business, Event } from '../data';
import { fetchFeaturedBusinesses } from '../services/businesses';
import { fetchApprovedPosts } from '../services/posts';
import { fetchUpcomingEvents } from '../services/events';
import { SectionHeader } from '../components/Layout';
import { HomeHero, useHeroSlides } from '../components/HomeHero';
import { PinnedPostCard, PostCard, PostDetailSheet, formatPostDate } from '../components/Posts';
import { CheckCircle, MapPin, ChevronRight, StarIcon, NewsIcon } from '../components/Icons';
import { AuthUser } from '../types/auth';
import { useEffect, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { resolveFeedItem } from '../lib/share';
import type { Post } from '../data';
import type { Page } from '../components/Layout';

export function Home({
  user,
  goTo,
  onOpenFeedback,
}: {
  user: AuthUser;
  goTo: (p: Page) => void;
  onOpenFeedback: () => void;
}) {
  const { t } = useT();
  const heroSlides = useHeroSlides();
  const { detail, openDetail, closeDetail } = useNavigation();
  const [pinned, setPinned] = useState<Post[]>([]);
  const [latest, setLatest] = useState<Post[]>([]);
  const [featuredBiz, setFeaturedBiz] = useState<Business[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);

  const selected = detail?.type === 'post' ? [...pinned, ...latest].find((p) => {
    const { itemId } = resolveFeedItem(p);
    return itemId === detail.id || p.id === detail.id;
  }) ?? null : null;

  const openPost = (post: Post) => {
    const { itemId } = resolveFeedItem(post);
    openDetail({ type: 'post', id: itemId });
  };

  useEffect(() => {
    fetchApprovedPosts().then((posts) => {
      setPinned(posts.filter((p) => p.pinned));
      setLatest(posts.filter((p) => !p.pinned).slice(0, 2));
    });
    fetchFeaturedBusinesses().then(setFeaturedBiz);
    fetchUpcomingEvents(3).then(setUpcoming);
  }, []);

  return (
    <div className="pb-7 w-full max-w-full min-w-0 overflow-x-hidden box-border">
      <HomeHero
        userName={user.name.split(' ')[0]}
        city={user.city}
        slides={heroSlides}
        onNavigate={goTo}
      />

      {pinned.length > 0 && (
        <section className="section-lazy animate-rise" style={{ animationDelay: '0.05s' }}>
          <SectionHeader
            title={t('importantAnnouncements')}
            action={
              <button onClick={() => goTo('news')} className="text-xs font-bold text-crimson flex items-center gap-0.5 whitespace-nowrap tap-scale">
                {t('seeAll')} <ChevronRight size={14} />
              </button>
            }
          />
          <div className="px-4 space-y-3">
            {pinned.map((p) => (
              <PinnedPostCard key={p.id} post={p} onOpen={openPost} />
            ))}
          </div>
        </section>
      )}

      <section className="section-lazy animate-rise" style={{ animationDelay: '0.1s' }}>
        <SectionHeader
          title={t('latestNews')}
          action={
            <button onClick={() => goTo('news')} className="text-xs font-bold text-crimson flex items-center gap-0.5 whitespace-nowrap tap-scale">
              {t('seeAll')} <ChevronRight size={14} />
            </button>
          }
        />
        <div className="px-4 space-y-3">
          {latest.length > 0 ? (
            latest.map((p) => <PostCard key={p.id} post={p} onOpen={openPost} />)
          ) : (
            <button
              onClick={() => goTo('news')}
              className="w-full card-modern p-4 text-left tap-scale overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-navy/[0.04] via-transparent to-crimson/[0.08] pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shrink-0 shadow-lg shadow-navy/25 text-white">
                  <NewsIcon size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-navy font-display">{t('latestNews')}</div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t('newsTeaserDesc')}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-crimson/10 flex items-center justify-center shrink-0 group-hover:bg-crimson/20 transition-colors">
                  <ChevronRight size={16} className="text-crimson" />
                </div>
              </div>
            </button>
          )}
        </div>
      </section>

      <section className="section-lazy animate-rise" style={{ animationDelay: '0.15s' }}>
        <SectionHeader
          title={t('upcomingEvents')}
          action={
            <button onClick={() => goTo('events')} className="text-xs font-bold text-crimson flex items-center gap-0.5 whitespace-nowrap tap-scale">
              {t('seeAll')} <ChevronRight size={14} />
            </button>
          }
        />
        <div className="scroll-row-x gap-3 px-4 pb-1">
          {upcoming.map((e) => (
            <button
              key={e.id}
              onClick={() => goTo('events')}
              className="shrink-0 w-[236px] overflow-hidden card-modern text-left tap-scale snap-start"
            >
              <div className={`h-28 bg-gradient-to-br ${e.color} flex items-center justify-center text-4xl relative overflow-hidden`}>
                {e.image ? (
                  <>
                    <img src={e.image} alt="" className="absolute inset-0 w-full h-full img-hd" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                    <span className="relative drop-shadow-lg">{e.emoji}</span>
                  </>
                ) : (
                  e.emoji
                )}
              </div>
              <div className="p-3.5">
                <div className="text-[10px] font-extrabold text-crimson uppercase tracking-wide">
                  {formatPostDate(e.date)} • {e.time}
                </div>
                <h4 className="font-extrabold text-navy text-sm mt-1 line-clamp-2 leading-snug font-display">{e.title}</h4>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 min-w-0">
                  <MapPin size={11} className="shrink-0 text-crimson/70" />
                  <span className="truncate">{e.location}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-lazy px-4 mt-6 animate-rise" style={{ animationDelay: '0.2s' }}>
        <button
          type="button"
          onClick={onOpenFeedback}
          className="w-full bg-gradient-to-r from-navy/[0.04] via-crimson/[0.06] to-navy/[0.04] border border-navy/10 rounded-[1.35rem] p-4 flex items-center gap-4 text-left tap-scale shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl btn-crimson flex items-center justify-center shrink-0">
            <StarIcon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-navy text-sm font-display">{t('feedbackCardTitle')}</div>
            <div className="text-xs text-slate-600 mt-1 leading-relaxed">{t('feedbackCardDesc')}</div>
          </div>
          <ChevronRight size={18} className="text-crimson shrink-0" />
        </button>
      </section>

      <section className="section-lazy animate-rise" style={{ animationDelay: '0.25s' }}>
        <SectionHeader
          title={t('featuredBusinesses')}
          action={
            <button onClick={() => goTo('businesses')} className="text-xs font-bold text-crimson flex items-center gap-0.5 whitespace-nowrap tap-scale">
              {t('seeAll')} <ChevronRight size={14} />
            </button>
          }
        />
        <div className="px-4 grid grid-cols-2 gap-3 pb-4">
          {featuredBiz.map((b) => (
            <button
              key={b.id}
              onClick={() => goTo('businesses')}
              className="card-modern overflow-hidden text-left tap-scale"
            >
              <div className={`h-28 bg-gradient-to-br ${b.color} flex items-center justify-center text-4xl relative overflow-hidden`}>
                {b.image ? (
                  <>
                    <img src={b.image} alt="" className="absolute inset-0 w-full h-full img-hd" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="relative drop-shadow-md">{b.emoji}</span>
                  </>
                ) : (
                  b.emoji
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-navy text-xs leading-tight line-clamp-1 flex-1 font-display">{b.name}</h4>
                  {b.verified && <CheckCircle size={12} className="text-crimson shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">{b.category} • {b.city}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <PostDetailSheet post={selected} open={!!selected} onClose={closeDetail} />
    </div>
  );
}
