import { useT } from '../i18n';
import { Business, Event } from '../data';
import { fetchFeaturedBusinesses } from '../services/businesses';
import { fetchApprovedPosts } from '../services/posts';
import { fetchUpcomingEvents } from '../services/events';
import { SectionHeader } from '../components/Layout';
import { HomeHero, useHeroSlides } from '../components/HomeHero';
import { PinnedPostCard, PostDetailSheet, formatPostDate } from '../components/Posts';
import { CheckCircle, MapPin, ChevronRight, StarIcon } from '../components/Icons';
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
  const [featuredBiz, setFeaturedBiz] = useState<Business[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);

  const selected = detail?.type === 'post' ? pinned.find((p) => {
    const { itemId } = resolveFeedItem(p);
    return itemId === detail.id || p.id === detail.id;
  }) ?? null : null;

  const openPost = (post: Post) => {
    const { itemId } = resolveFeedItem(post);
    openDetail({ type: 'post', id: itemId });
  };

  useEffect(() => {
    fetchApprovedPosts().then((posts) => setPinned(posts.filter((p) => p.pinned)));
    fetchFeaturedBusinesses().then(setFeaturedBiz);
    fetchUpcomingEvents(3).then(setUpcoming);
  }, []);

  return (
    <div className="pb-4 min-w-0 overflow-x-clip">
      <HomeHero
        userName={user.name.split(' ')[0]}
        city={user.city}
        slides={heroSlides}
        onNavigate={goTo}
      />

      {pinned.length > 0 && (
        <>
          <SectionHeader
            title={t('importantAnnouncements')}
            action={
              <button onClick={() => goTo('news')} className="text-xs font-bold text-crimson flex items-center">
                {t('seeAll')} <ChevronRight size={14} />
              </button>
            }
          />
          <div className="px-4 space-y-3">
            {pinned.map((p) => (
              <PinnedPostCard key={p.id} post={p} onOpen={openPost} />
            ))}
          </div>
        </>
      )}

      <SectionHeader
        title={t('latestNews')}
        action={
          <button onClick={() => goTo('news')} className="text-xs font-bold text-crimson flex items-center">
            {t('seeAll')} <ChevronRight size={14} />
          </button>
        }
      />
      <div className="px-4">
        <button
          onClick={() => goTo('news')}
          className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left shadow-sm active:scale-[0.99] transition"
        >
          <div className="text-sm font-bold text-navy">📰 {t('latestNews')}</div>
          <p className="text-xs text-slate-500 mt-1">Community news, alerts, church updates & more</p>
          <div className="text-[10px] font-bold text-crimson mt-2">{t('seeAll')} →</div>
        </button>
      </div>

      <SectionHeader
        title={t('upcomingEvents')}
        action={
          <button onClick={() => goTo('events')} className="text-xs font-bold text-crimson flex items-center">
            {t('seeAll')} <ChevronRight size={14} />
          </button>
        }
      />
      <div className="overflow-x-auto phone-scroll overscroll-x-contain touch-scroll-x pb-1 -mx-4 px-4">
        <div className="flex gap-3 w-max">
          {upcoming.map((e) => (
            <button
              key={e.id}
              onClick={() => goTo('events')}
              className="shrink-0 w-[min(240px,calc(100vw-2.5rem))] rounded-2xl overflow-hidden shadow-md bg-white border border-slate-100 text-left active:scale-[0.98] transition snap-start"
            >
              <div className={`h-20 bg-gradient-to-br ${e.color} flex items-center justify-center text-4xl`}>
                {e.emoji}
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold text-crimson uppercase">
                  {formatPostDate(e.date)} • {e.time}
                </div>
                <h4 className="font-bold text-navy text-sm mt-0.5 line-clamp-2">{e.title}</h4>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500 min-w-0">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{e.location}</span>
                </div>
              </div>
            </button>
          ))}
          <div className="shrink-0 w-1" aria-hidden />
        </div>
      </div>

      <div className="px-4 mt-5">
        <button
          type="button"
          onClick={onOpenFeedback}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99] transition shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
            <StarIcon size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-navy text-sm">{t('feedbackCardTitle')}</div>
            <div className="text-xs text-slate-600 mt-0.5">{t('feedbackCardDesc')}</div>
          </div>
          <ChevronRight size={18} className="text-amber-600 shrink-0" />
        </button>
      </div>

      <SectionHeader
        title={t('featuredBusinesses')}
        action={
          <button onClick={() => goTo('businesses')} className="text-xs font-bold text-crimson flex items-center">
            {t('seeAll')} <ChevronRight size={14} />
          </button>
        }
      />
      <div className="px-4 grid grid-cols-2 gap-3 pb-4">
        {featuredBiz.map((b) => (
          <button
            key={b.id}
            onClick={() => goTo('businesses')}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left active:scale-[0.98] transition"
          >
            <div className={`h-20 bg-gradient-to-br ${b.color} flex items-center justify-center text-4xl`}>
              {b.emoji}
            </div>
            <div className="p-2.5">
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-navy text-xs leading-tight line-clamp-1 flex-1">{b.name}</h4>
                {b.verified && <CheckCircle size={12} className="text-crimson shrink-0" />}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{b.category} • {b.city}</div>
            </div>
          </button>
        ))}
      </div>

      <PostDetailSheet post={selected} open={!!selected} onClose={closeDetail} />
    </div>
  );
}
