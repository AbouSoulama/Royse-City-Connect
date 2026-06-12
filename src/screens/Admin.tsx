import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { Post, Business, Event, Job, categoryEmoji } from '../data';
import { fetchBusinessesForAdmin, toggleBusinessFeatured, toggleBusinessVerified, updateBusinessStatus } from '../services/businesses';
import { fetchEventsForAdmin, toggleEventFeatured, updateEventStatus } from '../services/events';
import { deleteJob, fetchJobsForAdmin, updateJobStatus } from '../services/jobs';
import { fetchPostsForAdmin, togglePostPin, updatePostStatus } from '../services/posts';
import { fetchFeedbackForAdmin } from '../services/feedback';
import type { AppFeedback } from '../services/feedback';
import { ChevronLeft, CheckCircle, XIcon, PinIcon, ShieldIcon, StarIcon } from '../components/Icons';

type Tab = 'overview' | 'posts' | 'businesses' | 'events' | 'jobs' | 'users';

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="min-h-full bg-slate-50 pb-6">
      <div className="bg-gradient-to-br from-crimson via-crimson-dark to-rose-900 text-white px-4 pt-5 pb-8 relative">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-white/15 z-10">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center pt-1 pb-2">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
            <ShieldIcon size={12} /> Admin
          </div>
          <h1 className="text-xl font-extrabold mt-2">{t('adminPanel')}</h1>
          <p className="text-white/70 text-xs">Manage community content and users</p>
        </div>
      </div>

      <div className="px-3 -mt-5 relative z-20 mb-3">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-1.5 flex gap-1 overflow-x-auto phone-scroll">
          {(['overview', 'posts', 'businesses', 'events', 'jobs', 'users'] as Tab[]).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`shrink-0 text-[10px] font-bold py-2.5 px-3 rounded-xl uppercase whitespace-nowrap ${
                tab === tb ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tb}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === 'overview' && <Overview onNavigate={setTab} />}
        {tab === 'posts' && <PostsModeration />}
        {tab === 'businesses' && <BusinessesModeration />}
        {tab === 'events' && <EventsModeration />}
        {tab === 'jobs' && <JobsModeration />}
        {tab === 'users' && <UsersAdmin />}
      </div>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t } = useT();
  const [stats, setStats] = useState({ posts: 0, businesses: 0, events: 0, jobs: 0, pendingBiz: 0 });
  const [feedback, setFeedback] = useState<AppFeedback[]>([]);

  useEffect(() => {
    Promise.all([
      fetchPostsForAdmin(),
      fetchBusinessesForAdmin(),
      fetchEventsForAdmin(),
      fetchJobsForAdmin(),
    ]).then(([posts, businesses, events, jobs]) => {
      setStats({
        posts: posts.filter((p) => p.status === 'pending').length,
        businesses: businesses.length,
        events: events.length,
        jobs: jobs.filter((j) => j.status === 'pending').length,
        pendingBiz: businesses.filter((b) => b.status === 'pending').length,
      });
    });
    fetchFeedbackForAdmin().then(setFeedback);
  }, []);

  const activities: { emoji: string; text: string; time: string; tab: Tab }[] = [
    { emoji: '✅', text: "Approved post: 'Sunday service - CCF Dallas'", time: '10 min ago', tab: 'posts' },
    { emoji: '📌', text: "Pinned: 'Severe weather alert'", time: '2h ago', tab: 'posts' },
    { emoji: '✓', text: 'Verified business: Mama Africa Market', time: '1d ago', tab: 'businesses' },
    { emoji: '🚫', text: 'Review user reports', time: '2d ago', tab: 'users' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('totalUsers')} value="247" change="+18 this week" color="from-navy to-navy-light" emoji="👥" onClick={() => onNavigate('users')} />
        <StatCard label={t('activeUsers')} value="184" change="74% engagement" color="from-emerald-600 to-teal-700" emoji="📈" onClick={() => onNavigate('users')} />
        <StatCard label={t('businesses')} value={String(stats.businesses)} change={`${stats.pendingBiz} pending`} color="from-crimson to-crimson-dark" emoji="🏪" onClick={() => onNavigate('businesses')} />
        <StatCard label={t('events')} value={String(stats.events)} change="Manage events" color="from-amber-500 to-orange-600" emoji="📅" onClick={() => onNavigate('events')} />
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-extrabold text-navy mb-3">Pending review</h3>
        <div className="space-y-2">
          <PendingRow emoji="📝" label={`${stats.posts} posts pending`} count={stats.posts} onClick={() => onNavigate('posts')} />
          <PendingRow emoji="🏪" label={`${stats.pendingBiz} business verifications`} count={stats.pendingBiz} onClick={() => onNavigate('businesses')} />
          <PendingRow emoji="💼" label={`${stats.jobs} job posts pending`} count={stats.jobs} onClick={() => onNavigate('jobs')} />
          <PendingRow emoji="🚩" label="3 user reports" count={3} onClick={() => onNavigate('users')} />
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-extrabold text-navy mb-3">{t('appReviews')}</h3>
        <div className="space-y-2">
          {feedback.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No feedback yet.</p>}
          {feedback.slice(0, 5).map((f) => (
            <div key={f.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-navy text-sm">{f.userName}</span>
                <span className="text-xs text-amber-500">{'⭐'.repeat(f.rating)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{f.message}</p>
              <div className="text-[10px] text-slate-400 mt-1 capitalize">{f.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-extrabold text-navy mb-3">Recent activity</h3>
        <div className="space-y-2">
          {activities.map((a, i) => (
            <Activity key={i} emoji={a.emoji} text={a.text} time={a.time} onClick={() => onNavigate(a.tab)} />
          ))}
        </div>
      </div>
    </>
  );
}

function PostsModeration() {
  const { t } = useT();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchPostsForAdmin().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const pending = posts.filter((p) => p.status === 'pending');
  const approved = posts.filter((p) => p.status === 'approved');

  const handleStatus = async (postId: string, status: 'approved' | 'rejected') => {
    setActionId(postId);
    const { error } = await updatePostStatus(postId, status);
    if (!error) load();
    setActionId(null);
  };

  const handlePin = async (postId: string, pinned: boolean) => {
    setActionId(postId);
    const { error } = await togglePostPin(postId, pinned);
    if (!error) load();
    setActionId(null);
  };

  if (loading) {
    return <div className="text-center text-xs text-slate-400 py-8">Loading posts…</div>;
  }

  return (
    <div className="space-y-4">
      <Section title={`${t('pendingPosts')} (${pending.length})`}>
        {pending.length === 0 && <Empty msg="No pending posts" />}
        {pending.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-amber-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{categoryEmoji[p.category]}</span>
              <h4 className="font-bold text-navy text-sm flex-1">{p.title}</h4>
              <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">PENDING</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{p.body}</p>
            <div className="text-[10px] text-slate-400 mt-1">By {p.author} • {p.city}</div>
            <div className="flex gap-2 mt-2">
              <Btn color="emerald" icon={<CheckCircle size={12} />} disabled={actionId === p.id} onClick={() => handleStatus(p.id, 'approved')}>{t('approve')}</Btn>
              <Btn color="red" icon={<XIcon size={12} />} disabled={actionId === p.id} onClick={() => handleStatus(p.id, 'rejected')}>{t('reject')}</Btn>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Approved posts">
        {approved.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2">
            <span className="text-xl">{categoryEmoji[p.category]}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-navy text-sm truncate">{p.title}</h4>
              <div className="text-[10px] text-slate-400">By {p.author}</div>
            </div>
            <button
              disabled={actionId === p.id}
              onClick={() => handlePin(p.id, !p.pinned)}
              className={`p-1.5 rounded-lg ${p.pinned ? 'bg-crimson/10 text-crimson' : 'bg-slate-100 text-slate-500'}`}
            >
              <PinIcon size={14} />
            </button>
          </div>
        ))}
      </Section>
    </div>
  );
}

function BusinessesModeration() {
  const { t } = useT();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchBusinessesForAdmin().then((data) => {
      setBusinesses(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const pending = businesses.filter((b) => b.status === 'pending');
  const approved = businesses.filter((b) => !b.status || b.status === 'approved');

  const run = async (id: string, fn: () => Promise<{ error?: string }>) => {
    setActionId(id);
    const { error } = await fn();
    if (!error) load();
    setActionId(null);
  };

  if (loading) {
    return <div className="text-center text-xs text-slate-400 py-8">Loading businesses…</div>;
  }

  return (
    <div className="space-y-4">
      <Section title={`${t('pendingBusinesses')} (${pending.length})`}>
        {pending.length === 0 && <Empty msg="No pending businesses" />}
        {pending.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-amber-200 p-3 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl shrink-0`}>{b.emoji}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-navy text-sm truncate">{b.name}</h4>
              <div className="text-[11px] text-slate-500">{b.category} • {b.city}</div>
              <div className="text-[10px] text-slate-400">{b.owner}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Btn color="emerald" small disabled={actionId === b.id} onClick={() => run(b.id, () => updateBusinessStatus(b.id, 'approved'))}>{t('approve')}</Btn>
              <Btn color="red" small disabled={actionId === b.id} onClick={() => run(b.id, () => updateBusinessStatus(b.id, 'rejected'))}>{t('reject')}</Btn>
            </div>
          </div>
        ))}
      </Section>

      <Section title={`${t('businesses')} (${approved.length})`}>
        {approved.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl shrink-0`}>{b.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-navy text-sm truncate">{b.name}</h4>
                {b.verified && <CheckCircle size={12} className="text-crimson shrink-0" />}
                {b.featured && <StarIcon size={12} className="text-amber-500 shrink-0" />}
              </div>
              <div className="text-[11px] text-slate-500">{b.category} • {b.city}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Btn
                color="emerald"
                small
                disabled={actionId === b.id}
                onClick={() => run(b.id, () => toggleBusinessVerified(b.id, !b.verified))}
              >
                {b.verified ? 'Unverify' : t('verify')}
              </Btn>
              <Btn
                color="amber"
                small
                icon={<StarIcon size={10} />}
                disabled={actionId === b.id}
                onClick={() => run(b.id, () => toggleBusinessFeatured(b.id, !b.featured))}
              >
                {b.featured ? 'Unfeature' : t('feature')}
              </Btn>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function EventsModeration() {
  const { t } = useT();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchEventsForAdmin().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const pending = events.filter((e) => e.status === 'pending');
  const approved = events.filter((e) => !e.status || e.status === 'approved');

  const run = async (id: string, fn: () => Promise<{ error?: string }>) => {
    setActionId(id);
    const { error } = await fn();
    if (!error) load();
    setActionId(null);
  };

  if (loading) return <div className="text-center text-xs text-slate-400 py-8">Loading events…</div>;

  return (
    <div className="space-y-4">
      <Section title={`Pending events (${pending.length})`}>
        {pending.length === 0 && <Empty msg="No pending events" />}
        {pending.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl border border-amber-200 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-navy text-sm truncate">{e.title}</h4>
                <div className="text-[10px] text-slate-400">{e.organizer} • {e.city}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Btn color="emerald" small disabled={actionId === e.id} onClick={() => run(e.id, () => updateEventStatus(e.id, 'approved'))}>{t('approve')}</Btn>
              <Btn color="red" small disabled={actionId === e.id} onClick={() => run(e.id, () => updateEventStatus(e.id, 'rejected'))}>{t('reject')}</Btn>
            </div>
          </div>
        ))}
      </Section>

      <Section title={`${t('events')} (${approved.length})`}>
        {approved.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3">
            <span className="text-2xl">{e.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-navy text-sm truncate">{e.title}</h4>
              <div className="text-[10px] text-slate-400">{e.date} • {e.city}</div>
            </div>
            <Btn color="amber" small icon={<StarIcon size={10} />} disabled={actionId === e.id}
              onClick={() => run(e.id, () => toggleEventFeatured(e.id, !e.featured))}>
              {e.featured ? 'Unfeature' : t('feature')}
            </Btn>
          </div>
        ))}
      </Section>
    </div>
  );
}

function JobsModeration() {
  const { t } = useT();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchJobsForAdmin().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const pending = jobs.filter((j) => j.status === 'pending');
  const approved = jobs.filter((j) => !j.status || j.status === 'approved');

  const run = async (id: string, fn: () => Promise<{ error?: string }>) => {
    setActionId(id);
    const { error } = await fn();
    if (!error) load();
    setActionId(null);
  };

  if (loading) return <div className="text-center text-xs text-slate-400 py-8">Loading jobs…</div>;

  return (
    <div className="space-y-4">
      <Section title={`${t('pendingJobs')} (${pending.length})`}>
        {pending.length === 0 && <Empty msg="No pending jobs" />}
        {pending.map((j) => (
          <div key={j.id} className="bg-white rounded-2xl border border-amber-200 p-3">
            <h4 className="font-bold text-navy text-sm">{j.title}</h4>
            <div className="text-[11px] text-slate-500">{j.postedBy} • {j.location}</div>
            <div className="flex gap-2 mt-2">
              <Btn color="emerald" icon={<CheckCircle size={12} />} disabled={actionId === j.id} onClick={() => run(j.id, () => updateJobStatus(j.id, 'approved'))}>{t('approve')}</Btn>
              <Btn color="red" disabled={actionId === j.id} onClick={() => run(j.id, () => updateJobStatus(j.id, 'rejected'))}>{t('reject')}</Btn>
            </div>
          </div>
        ))}
      </Section>

      <Section title={`${t('opportunities')} (${approved.length})`}>
        {approved.map((j) => (
          <div key={j.id} className="bg-white rounded-2xl border border-slate-100 p-3">
            <h4 className="font-bold text-navy text-sm">{j.title}</h4>
            <div className="text-[11px] text-slate-500">{j.postedBy} • {j.location}</div>
            <div className="flex gap-2 mt-2">
              <Btn color="red" small disabled={actionId === j.id} onClick={() => run(j.id, () => deleteJob(j.id))}>{t('delete')}</Btn>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function UsersAdmin() {
  const { t } = useT();
  const users = [
    { name: 'Amina Bello', role: 'member', city: 'Royse City', email: 'amina@example.com' },
    { name: 'Sarah Eyong', role: 'business', city: 'Rockwall', email: 'sarah@mamamarket.com' },
    { name: 'Jean-Paul Mbarga', role: 'business', city: 'Royse City', email: 'jp@autorepair.com' },
    { name: 'Kwame Asante', role: 'admin', city: 'Royse City', email: 'kwame@rcconnect.app' },
    { name: 'Marie Ngono', role: 'business', city: 'Dallas', email: 'marie@cheztantine.com' },
    { name: 'Fatou Sow', role: 'member', city: 'Dallas', email: 'fatou@example.com' },
  ];
  return (
    <Section title={`${t('users')} (${users.length})`}>
      {users.map((u, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light text-white flex items-center justify-center font-bold text-sm shrink-0">
            {u.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-navy text-sm truncate">{u.name}</h4>
              {u.role === 'admin' && <span className="text-[9px] bg-crimson text-white font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
              {u.role === 'business' && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">BIZ</span>}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{u.email} • {u.city}</div>
          </div>
          <Btn color="red" small>{t('suspend')}</Btn>
        </div>
      ))}
    </Section>
  );
}

// Helpers
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-2 px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatCard({ label, value, change, color, emoji, onClick }: { label: string; value: string; change: string; color: string; emoji: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-full text-left rounded-2xl bg-gradient-to-br ${color} text-white p-3 shadow-md active:scale-[0.98] transition`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      <div className="text-[10px] font-bold uppercase opacity-80">{label}</div>
      <div className="text-[10px] opacity-70 mt-0.5">{change}</div>
    </button>
  );
}

function PendingRow({ emoji, label, count, onClick }: { emoji: string; label: string; count: number; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 active:scale-[0.99] transition text-left">
      <span className="text-lg">{emoji}</span>
      <span className="flex-1 text-xs text-navy font-semibold">{label}</span>
      {count > 0 && <span className="text-[10px] bg-crimson text-white font-bold px-2 py-0.5 rounded-full">{count}</span>}
      <span className="text-slate-300 text-xs">›</span>
    </button>
  );
}

function Activity({ emoji, text, time, onClick }: { emoji: string; text: string; time: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition text-left">
      <span>{emoji}</span>
      <div className="flex-1">
        <div className="text-slate-700">{text}</div>
        <div className="text-[10px] text-slate-400">{time}</div>
      </div>
      <span className="text-slate-300 self-center">›</span>
    </button>
  );
}

function Btn({
  children, color, icon, small, onClick, disabled,
}: {
  children: React.ReactNode;
  color: 'emerald' | 'red' | 'slate' | 'amber';
  icon?: React.ReactNode;
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-600 text-white',
    red: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color]} disabled:opacity-50 ${small ? 'text-[10px] px-2 py-1' : 'text-[11px] px-2.5 py-1.5'} rounded-lg font-bold flex items-center gap-1`}
    >
      {icon}{children}
    </button>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center text-xs text-slate-400 py-6">{msg}</div>;
}
