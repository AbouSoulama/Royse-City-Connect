import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { Post, Business, Event, Job, categoryEmoji } from '../data';
import { fetchBusinessesForAdmin, toggleBusinessFeatured, toggleBusinessVerified, updateBusinessStatus, deleteBusiness } from '../services/businesses';
import { fetchEventsForAdmin, toggleEventFeatured, updateEventStatus, deleteEvent } from '../services/events';
import { deleteJob, fetchJobsForAdmin, updateJobStatus } from '../services/jobs';
import { fetchPostsForAdmin, togglePostPin, updatePostStatus, deletePost } from '../services/posts';
import { fetchFeedbackForAdmin } from '../services/feedback';
import { fetchAdminStats, fetchAdminUsers, adminSetUserRole, adminDeleteUser, adminInviteUser } from '../services/admin';
import { fetchReportsForAdmin, updateReportStatus } from '../services/reports';
import type { AppFeedback } from '../services/feedback';
import type { ContentReport } from '../services/reports';
import type { AdminUser } from '../services/admin';
import { ChevronLeft, CheckCircle, XIcon, PinIcon, ShieldIcon, StarIcon } from '../components/Icons';

type Tab = 'overview' | 'posts' | 'businesses' | 'events' | 'jobs' | 'users' | 'reports';

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="min-h-full bg-slate-50 pb-6 min-w-0 overflow-x-clip">
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
          {(['overview', 'posts', 'businesses', 'events', 'jobs', 'users', 'reports'] as Tab[]).map((tb) => (
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
        {tab === 'reports' && <ReportsAdmin />}
      </div>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t } = useT();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers7d: null as number | null,
    pendingReports: 0,
    totalBusinesses: 0,
    totalEvents: 0,
    pendingPosts: 0,
    pendingBusinesses: 0,
    pendingJobs: 0,
  });
  const [feedback, setFeedback] = useState<AppFeedback[]>([]);

  useEffect(() => {
    fetchAdminStats().then(setAdminStats);
    fetchFeedbackForAdmin().then(setFeedback);
  }, []);

  const activeLabel =
    adminStats.activeUsers7d === null
      ? 'N/A'
      : `${adminStats.activeUsers7d} (${adminStats.totalUsers ? Math.round((adminStats.activeUsers7d / adminStats.totalUsers) * 100) : 0}%)`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('totalUsers')} value={String(adminStats.totalUsers)} change="Registered profiles" color="from-navy to-navy-light" emoji="👥" onClick={() => onNavigate('users')} />
        <StatCard label={t('activeUsers')} value={adminStats.activeUsers7d === null ? 'N/A' : String(adminStats.activeUsers7d)} change={activeLabel} color="from-emerald-600 to-teal-700" emoji="📈" onClick={() => onNavigate('users')} />
        <StatCard label={t('businesses')} value={String(adminStats.totalBusinesses)} change={`${adminStats.pendingBusinesses} pending`} color="from-crimson to-crimson-dark" emoji="🏪" onClick={() => onNavigate('businesses')} />
        <StatCard label={t('events')} value={String(adminStats.totalEvents)} change="Approved events" color="from-amber-500 to-orange-600" emoji="📅" onClick={() => onNavigate('events')} />
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-extrabold text-navy mb-3">Pending review</h3>
        <div className="space-y-2">
          <PendingRow emoji="📝" label={`${adminStats.pendingPosts} posts pending`} count={adminStats.pendingPosts} onClick={() => onNavigate('posts')} />
          <PendingRow emoji="🏪" label={`${adminStats.pendingBusinesses} business verifications`} count={adminStats.pendingBusinesses} onClick={() => onNavigate('businesses')} />
          <PendingRow emoji="💼" label={`${adminStats.pendingJobs} job posts pending`} count={adminStats.pendingJobs} onClick={() => onNavigate('jobs')} />
          <PendingRow emoji="🚩" label={`${adminStats.pendingReports} content reports`} count={adminStats.pendingReports} onClick={() => onNavigate('reports')} />
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
            <div className="flex gap-2 mt-2 flex-wrap">
              <Btn color="emerald" icon={<CheckCircle size={12} />} disabled={actionId === p.id} onClick={() => handleStatus(p.id, 'approved')}>{t('approve')}</Btn>
              <Btn color="red" icon={<XIcon size={12} />} disabled={actionId === p.id} onClick={() => handleStatus(p.id, 'rejected')}>{t('reject')}</Btn>
              <Btn color="red" small disabled={actionId === p.id} onClick={async () => { if (confirm('Delete permanently?')) { setActionId(p.id); await deletePost(p.id); load(); setActionId(null); } }}>{t('delete')}</Btn>
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
            <Btn color="red" small disabled={actionId === p.id} onClick={async () => { if (confirm('Delete permanently?')) { setActionId(p.id); await deletePost(p.id); load(); setActionId(null); } }}>{t('delete')}</Btn>
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
              <Btn color="red" small disabled={actionId === b.id} onClick={() => { if (confirm('Delete permanently?')) run(b.id, () => deleteBusiness(b.id)); }}>{t('delete')}</Btn>
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
              <Btn color="red" small disabled={actionId === b.id} onClick={() => { if (confirm('Delete permanently?')) run(b.id, () => deleteBusiness(b.id)); }}>{t('delete')}</Btn>
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
            <div className="flex gap-2 mt-2 flex-wrap">
              <Btn color="emerald" small disabled={actionId === e.id} onClick={() => run(e.id, () => updateEventStatus(e.id, 'approved'))}>{t('approve')}</Btn>
              <Btn color="red" small disabled={actionId === e.id} onClick={() => run(e.id, () => updateEventStatus(e.id, 'rejected'))}>{t('reject')}</Btn>
              <Btn color="red" small disabled={actionId === e.id} onClick={() => { if (confirm('Delete permanently?')) run(e.id, () => deleteEvent(e.id)); }}>{t('delete')}</Btn>
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
            <div className="flex flex-col gap-1">
            <Btn color="amber" small icon={<StarIcon size={10} />} disabled={actionId === e.id}
              onClick={() => run(e.id, () => toggleEventFeatured(e.id, !e.featured))}>
              {e.featured ? 'Unfeature' : t('feature')}
            </Btn>
            <Btn color="red" small disabled={actionId === e.id} onClick={() => { if (confirm('Delete permanently?')) run(e.id, () => deleteEvent(e.id)); }}>{t('delete')}</Btn>
            </div>
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
            <div className="flex gap-2 mt-2 flex-wrap">
              <Btn color="emerald" icon={<CheckCircle size={12} />} disabled={actionId === j.id} onClick={() => run(j.id, () => updateJobStatus(j.id, 'approved'))}>{t('approve')}</Btn>
              <Btn color="red" disabled={actionId === j.id} onClick={() => run(j.id, () => updateJobStatus(j.id, 'rejected'))}>{t('reject')}</Btn>
              <Btn color="red" small disabled={actionId === j.id} onClick={() => { if (confirm('Delete permanently?')) run(j.id, () => deleteJob(j.id)); }}>{t('delete')}</Btn>
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'member' as AdminUser['role'] });
  const [inviteMsg, setInviteMsg] = useState('');

  const load = () => {
    setLoading(true);
    fetchAdminUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleRole = async (userId: string, role: AdminUser['role']) => {
    setActionId(userId);
    const { error } = await adminSetUserRole(userId, role);
    if (!error) load();
    else alert(error);
    setActionId(null);
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete profile for ${name}? They must sign up again to return.`)) return;
    setActionId(userId);
    const { error } = await adminDeleteUser(userId);
    if (!error) load();
    else alert(error);
    setActionId(null);
  };

  const handleInvite = async () => {
    if (!inviteForm.email.trim()) return;
    setInviteMsg('');
    const { error } = await adminInviteUser(inviteForm);
    if (error) { setInviteMsg(error); return; }
    setInviteMsg('Invite saved. User will get this role when they sign up with this email.');
    setInviteForm({ email: '', name: '', role: 'member' });
    setShowInvite(false);
  };

  if (loading) return <div className="text-center text-xs text-slate-400 py-8">Loading users…</div>;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowInvite(!showInvite)}
        className="w-full bg-navy text-white font-bold py-3 rounded-xl text-sm"
      >
        + Invite / add user
      </button>

      {showInvite && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-xs text-slate-500">Pre-assign role before signup. User creates account with this email.</p>
          <input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="Email" type="email" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as AdminUser['role'] })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="member">Member</option>
            <option value="business">Business</option>
            <option value="admin">Admin</option>
          </select>
          <button type="button" onClick={handleInvite} className="w-full bg-crimson text-white font-bold py-2.5 rounded-xl text-sm">Save invite</button>
        </div>
      )}
      {inviteMsg && <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl">{inviteMsg}</p>}

      <Section title={`${t('users')} (${users.length})`}>
        {users.length === 0 && <Empty msg="No users found" />}
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light text-white flex items-center justify-center font-bold text-sm shrink-0">
                {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-navy text-sm truncate">{u.name}</h4>
                  {u.role === 'admin' && <span className="text-[9px] bg-crimson text-white font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
                  {u.role === 'business' && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">BIZ</span>}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{u.phone || '—'} • {u.city}</div>
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {(['member', 'business', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={actionId === u.id || u.role === role}
                  onClick={() => handleRole(u.id, role)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${u.role === role ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {role}
                </button>
              ))}
              <Btn color="red" small disabled={actionId === u.id} onClick={() => handleDelete(u.id, u.name)}>{t('delete')}</Btn>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function ReportsAdmin() {
  const { t } = useT();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchReportsForAdmin().then((data) => {
      setReports(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id: string, status: 'reviewed' | 'dismissed') => {
    setActionId(id);
    const { error } = await updateReportStatus(id, status);
    if (!error) load();
    setActionId(null);
  };

  if (loading) return <div className="text-center text-xs text-slate-400 py-8">Loading reports…</div>;

  const pending = reports.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-4">
      <Section title={`Reports (${pending.length} pending)`}>
        {pending.length === 0 && <Empty msg="No pending reports" />}
        {reports.map((r) => (
          <div key={r.id} className={`bg-white rounded-2xl border p-3 ${r.status === 'pending' ? 'border-amber-200' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🚩</span>
              <h4 className="font-bold text-navy text-sm flex-1 capitalize">{r.reason}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.status}
              </span>
            </div>
            <p className="text-xs text-slate-600">{r.message || 'No additional message'}</p>
            <div className="text-[10px] text-slate-400 mt-1">{r.itemType} • {r.itemId.slice(0, 8)}… • {new Date(r.createdAt).toLocaleString()}</div>
            {r.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <Btn color="emerald" icon={<CheckCircle size={12} />} disabled={actionId === r.id} onClick={() => handleStatus(r.id, 'reviewed')}>{t('approve')}</Btn>
                <Btn color="red" disabled={actionId === r.id} onClick={() => handleStatus(r.id, 'dismissed')}>{t('reject')}</Btn>
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
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
