import { useEffect, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { resolveFeedItem } from '../lib/share';
import { useT, TKey } from '../i18n';
import { Post, PostCategory, FeedCategory, categoryEmoji, cities } from '../data';
import { ModalSheet, Page } from '../components/Layout';
import { PostCard, PostDetailSheet } from '../components/Posts';
import { ImageUpload } from '../components/ImageUpload';
import { PlusIcon } from '../components/Icons';
import { AuthUser } from '../types/auth';
import { createPost, fetchCommunityFeed, getFeedCategory } from '../services/posts';

type NewsFilter = FeedCategory | 'all';

const catFilters: { key: NewsFilter; tkey: TKey }[] = [
  { key: 'all', tkey: 'catAll' },
  { key: 'news', tkey: 'catNews' },
  { key: 'hospitality', tkey: 'catHospitality' },
  { key: 'realestate', tkey: 'catRealestate' },
  { key: 'event', tkey: 'catEvent' },
  { key: 'job', tkey: 'catJob' },
  { key: 'business', tkey: 'catBusiness' },
  { key: 'immigration', tkey: 'catImmigration' },
  { key: 'alert', tkey: 'catAlert' },
  { key: 'church', tkey: 'catChurch' },
  { key: 'association', tkey: 'catAssociation' },
  { key: 'fundraiser', tkey: 'catFundraiser' },
  { key: 'funeral', tkey: 'catFuneral' },
];

export function News({ user, goTo }: { user: AuthUser; goTo?: (p: Page) => void }) {
  const { t } = useT();
  const { detail, openDetail, closeDetail } = useNavigation();
  const [filter, setFilter] = useState<NewsFilter>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);

  const selected = detail?.type === 'post' ? posts.find((p) => {
    const { itemId } = resolveFeedItem(p);
    return itemId === detail.id || p.id === detail.id;
  }) ?? null : null;

  const load = () => {
    setLoading(true);
    fetchCommunityFeed().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = posts.filter((p) => {
    if (filter === 'all') return true;
    return getFeedCategory(p) === filter;
  });

  const openPost = (post: Post) => {
    const { itemId } = resolveFeedItem(post);
    openDetail({ type: 'post', id: itemId });
  };

  const handleOpenLink = (post: Post) => {
    if (!goTo || !post.linkPage) return;
    closeDetail();
    goTo(post.linkPage);
  };

  return (
    <div className="pb-4">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-navy">{t('latestNews')}</h1>
            <p className="text-xs text-slate-500">{filtered.length} items</p>
          </div>
          {!user.guest && user.id && (
            <button onClick={() => setPostOpen(true)} className="flex items-center gap-1 bg-crimson text-white text-xs font-bold px-3 py-2 rounded-xl">
              <PlusIcon size={14} /> Post
            </button>
          )}
        </div>
        <div className="overflow-x-auto phone-scroll overscroll-x-contain mt-3 pb-1">
          <div className="flex gap-2 w-max px-0.5">
            {catFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  filter === f.key ? 'bg-navy text-white shadow' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t(f.tkey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && <div className="text-center text-sm text-slate-400 py-8">Loading…</div>}
        {!loading && filtered.map((p) => (
          <PostCard key={p.id} post={p} onOpen={openPost} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">— No posts in this category —</div>
        )}
      </div>

      <PostDetailSheet
        post={selected}
        open={!!selected}
        onClose={closeDetail}
        onOpenLink={goTo ? handleOpenLink : undefined}
      />

      <ModalSheet open={postOpen} onClose={() => setPostOpen(false)} title="Post announcement">
        <CreatePostForm user={user} onClose={() => setPostOpen(false)} onSuccess={() => { setPostOpen(false); load(); }} />
      </ModalSheet>
    </div>
  );
}

function CreatePostForm({ user, onClose, onSuccess }: { user: AuthUser; onClose: () => void; onSuccess: () => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [form, setForm] = useState({
    category: 'news' as PostCategory,
    title: '',
    body: '',
    city: user.city || 'Royse City',
  });

  if (!user.id || user.guest) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-600">Sign in to post.</p>
        <button onClick={onClose} className="mt-4 text-crimson font-bold text-sm">{t('close')}</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm text-navy font-semibold">Post submitted for review!</p>
        <button onClick={onSuccess} className="mt-4 w-full bg-crimson text-white font-bold py-3 rounded-xl">{t('close')}</button>
      </div>
    );
  }

  const submit = async () => {
    if (!form.title || !form.body) { setError('Title and body required.'); return; }
    setLoading(true);
    const { error: err } = await createPost({
      authorId: user.id!, authorName: user.name,
      category: form.category, title: form.title, body: form.body, city: form.city, imageUrl,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess(true);
  };

  const categories: PostCategory[] = [
    'news', 'hospitality', 'realestate', 'immigration', 'church',
    'association', 'fundraiser', 'funeral', 'alert',
  ];

  return (
    <div className="p-4 space-y-3 pb-6">
      <label className="block">
        <span className="text-xs font-bold text-slate-600">Category</span>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PostCategory })}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none">
          {categories.map((c) => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-600">Title</span>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-600">Message</span>
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none resize-none" />
      </label>
      <ImageUpload folder="posts" value={imageUrl} onChange={setImageUrl} />
      <label className="block">
        <span className="text-xs font-bold text-slate-600">{t('city')}</span>
        <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none">
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      {error && <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}
      <button onClick={submit} disabled={loading} className="w-full bg-crimson text-white font-bold py-3.5 rounded-xl disabled:opacity-60">
        {loading ? '…' : t('submit')}
      </button>
    </div>
  );
}
