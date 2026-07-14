import { useEffect, useState } from 'react';
import { useT, TKey } from '../i18n';
import { Post, FeedCategory, categoryColors, categoryEmoji } from '../data';
import { getFeedCategory } from '../services/posts';
import { ModalSheet } from './Layout';
import { HeartIcon, BookmarkIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { isItemSaved, toggleSavedItem } from '../services/savedItems';
import { fetchReactionCount, hasUserLiked, toggleLike } from '../services/reactions';
import { resolveFeedItem, shareItem } from '../lib/share';
import { ReportSheet } from './ReportSheet';

export function formatPostDate(d: string) {
  return new Date(d + (d.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function labelFor(c: FeedCategory, t: (k: TKey) => string) {
  const map: Record<FeedCategory, TKey> = {
    news: 'catNews', immigration: 'catImmigration', church: 'catChurch',
    association: 'catAssociation', fundraiser: 'catFundraiser', funeral: 'catFuneral', alert: 'catAlert',
    hospitality: 'catHospitality', realestate: 'catRealestate',
    event: 'catEvent', job: 'catJob', business: 'catBusiness',
  };
  return t(map[c]);
}

function useSocialState(post: Post, userId?: string) {
  const { itemId, type } = resolveFeedItem(post);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.reactions ?? 0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      hasUserLiked(userId, itemId, type),
      isItemSaved(userId, itemId, type),
      fetchReactionCount(itemId, type),
    ]).then(([isLiked, isSaved, count]) => {
      if (cancelled) return;
      setLiked(isLiked);
      setSaved(isSaved);
      setLikeCount(count);
    });
    return () => { cancelled = true; };
  }, [itemId, type, userId, post.id]);

  const toggleSave = async () => {
    const now = await toggleSavedItem(userId, itemId, type);
    setSaved(now);
    return now;
  };

  const toggleLikeAction = async () => {
    if (!userId) return liked;
    const now = await toggleLike(userId, itemId, type);
    setLiked(now);
    setLikeCount((c) => (now ? c + 1 : Math.max(0, c - 1)));
    return now;
  };

  return { liked, saved, likeCount, toggleSave, toggleLikeAction, itemId, type };
}

export function PostCard({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) {
  const { t } = useT();
  const { user } = useAuth();
  const userId = user?.guest ? undefined : user?.id;
  const { liked, saved, likeCount, toggleSave, toggleLikeAction } = useSocialState(post, userId);

  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="w-full text-left shine-card rounded-[1.35rem] p-4 tap-scale transition"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap min-w-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${categoryColors[getFeedCategory(post)]}`}>
          {categoryEmoji[getFeedCategory(post)]} {labelFor(getFeedCategory(post), t)}
        </span>
        {post.important && <span className="text-[10px] font-bold text-crimson shrink-0">⚡ {t('new').toUpperCase()}</span>}
        <span className="text-[10px] text-slate-400 ml-auto shrink-0">{formatPostDate(post.date)}</span>
      </div>
      <h3 className="font-bold text-navy text-sm leading-tight break-words">{post.title}</h3>
      {post.image && <img src={post.image} alt="" className="img-content w-full mt-2 rounded-xl object-cover max-h-40" loading="lazy" decoding="async" />}
      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">{post.body}</p>
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 flex-wrap min-w-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-slate-500 flex-1 min-w-0 basis-full sm:basis-auto">
          <span className="font-bold text-navy">{post.author}</span>
          <span className="text-slate-400"> • {post.city}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
        <button
          type="button"
          aria-label="Like"
          onClick={() => toggleLikeAction()}
          className={`flex items-center gap-1 text-[11px] ${liked ? 'text-crimson' : 'text-slate-400'}`}
        >
          <HeartIcon size={14} className={liked ? 'fill-crimson' : ''} />
          {likeCount}
        </button>
        <button
          type="button"
          aria-label={t('save')}
          onClick={() => toggleSave()}
          className={saved ? 'text-crimson' : 'text-slate-400'}
        >
          <BookmarkIcon size={14} />
        </button>
        <button type="button" onClick={() => onOpen(post)} className="text-[10px] font-bold text-crimson whitespace-nowrap">{t('viewDetails')}</button>
        </div>
      </div>
    </button>
  );
}

export function PinnedPostCard({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="w-full text-left relative rounded-2xl p-4 bg-gradient-to-br from-crimson/5 to-amber-50 border-2 border-crimson/20 shadow-sm active:scale-[0.99] transition"
    >
      <div className="absolute -top-2 left-4 bg-crimson text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        📌 {t('pinned').toUpperCase()}
      </div>
      <div className="flex items-start gap-2 mt-1">
        <div className="text-2xl">{categoryEmoji[getFeedCategory(post)]}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-navy text-sm leading-tight">{post.title}</h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-3">{post.body}</p>
          <div className="flex items-center justify-between mt-2 gap-2 min-w-0">
            <span className="text-[11px] text-slate-500 min-w-0 truncate">
              <span className="font-semibold text-crimson">{post.author}</span> • {post.city}
            </span>
            <span className="text-[10px] font-bold text-crimson shrink-0 whitespace-nowrap">{t('viewDetails')} →</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function PostDetailSheet({
  post, open, onClose, onOpenLink,
}: {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onOpenLink?: (post: Post) => void;
}) {
  const { t } = useT();
  const { user } = useAuth();
  const userId = user?.guest ? undefined : user?.id;
  const [toast, setToast] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const social = useSocialState(post ?? {
    id: '', title: '', body: '', author: '', city: '', date: '', category: 'news', status: 'approved',
  }, userId);
  const { saved, likeCount, toggleSave, toggleLikeAction, itemId, type } = social;

  if (!post) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSave = async () => {
    const now = await toggleSave();
    showToast(now ? 'Saved!' : 'Removed from saved');
  };

  const handleShare = async () => {
    const result = await shareItem({ title: post.title, text: post.body, itemId, type });
    showToast(result === 'shared' ? 'Shared!' : 'Link copied to clipboard');
  };

  const handleLike = async () => {
    if (!userId) {
      showToast('Sign in to like posts');
      return;
    }
    await toggleLikeAction();
  };

  return (
    <>
      <ModalSheet open={open} onClose={onClose} title={post.title}>
        <div className="p-4 pb-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[getFeedCategory(post)]}`}>
              {categoryEmoji[getFeedCategory(post)]} {labelFor(getFeedCategory(post), t)}
            </span>
            <span className="text-[10px] text-slate-400">{formatPostDate(post.date)} • {post.city}</span>
          </div>

          {post.image && <img src={post.image} alt="" className="w-full rounded-2xl object-cover max-h-56" />}

          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
            <div><span className="font-bold text-navy">{t('postedBy')}:</span> {post.author}</div>
            <div className="mt-1"><span className="font-bold text-navy">{t('city')}:</span> {post.city}</div>
          </div>

          {post.linkPage && onOpenLink && (
            <button
              type="button"
              onClick={() => onOpenLink(post)}
              className="w-full bg-navy text-white font-bold py-3 rounded-xl text-sm"
            >
              {post.linkPage === 'events' ? t('openInEvents') : post.linkPage === 'opportunities' ? t('openInJobs') : t('openInBusinesses')} →
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ActionBtn
              label={saved ? t('save') + ' ✓' : t('save')}
              onClick={handleSave}
              primary
            />
            <ActionBtn label={t('share')} onClick={handleShare} />
            <ActionBtn
              label={t('reportContent')}
              onClick={() => {
                if (!userId) showToast('Sign in to report content');
                else setReportOpen(true);
              }}
            />
            <ActionBtn
              label={`♥ ${likeCount}`}
              onClick={handleLike}
            />
          </div>

          {toast && (
            <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl">{toast}</div>
          )}
        </div>
      </ModalSheet>

      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        itemId={itemId}
        itemType={type}
        reporterId={userId}
      />
    </>
  );
}

function ActionBtn({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 rounded-xl text-xs font-bold transition active:scale-95 ${
        primary ? 'bg-crimson text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
