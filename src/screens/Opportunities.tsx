import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useT } from '../i18n';
import { Job } from '../data';
import { ModalSheet } from '../components/Layout';
import type { AuthUser } from '../types/auth';
import type { JobType } from '../types/database';
import { ImageUpload } from '../components/ImageUpload';
import { createJob, fetchApprovedJobs } from '../services/jobs';
import { SearchIcon, MapPin, ClockIcon, ChevronLeft, PlusIcon, BriefIcon } from '../components/Icons';

const typeColors: Record<Job['type'], string> = {
  'Full-time': 'bg-emerald-100 text-emerald-700',
  'Part-time': 'bg-blue-100 text-blue-700',
  'Contract': 'bg-amber-100 text-amber-700',
  'Volunteer': 'bg-purple-100 text-purple-700',
};

export function Opportunities({ user }: { user: AuthUser }) {
  const { t, lang } = useT();
  const { detail, openDetail, closeDetail } = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<Job['type'] | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const selected = detail?.type === 'job' ? jobs.find((j) => j.id === detail.id) ?? null : null;

  const load = () => {
    setLoading(true);
    fetchApprovedJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => jobs.filter((j) => {
    if (type && j.type !== type) return false;
    if (search && !(j.title + j.description + j.location).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [jobs, search, type]);

  if (selected) return <JobDetail job={selected} onBack={closeDetail} />;

  return (
    <div className="pb-4 w-full max-w-full min-w-0 overflow-x-hidden box-border">
      <div className="page-header px-4 pt-4 pb-3 sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-navy font-display tracking-tight">{t('opportunities')}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{filtered.length} jobs and opportunities</p>

        <div className="mt-3 flex items-center gap-2 bg-navy/[0.05] rounded-2xl px-3.5 py-2.5 border border-navy/[0.04]">
          <SearchIcon size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchJob')}
            className="flex-1 bg-transparent outline-none text-sm text-navy"
          />
        </div>

        <div className="scroll-row-x mt-3">
          {(['Full-time', 'Part-time', 'Contract', 'Volunteer'] as Job['type'][]).map((tp) => (
            <button
              key={tp}
              onClick={() => setType(type === tp ? null : tp)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                type === tp ? 'chip-active' : 'bg-white text-slate-600 border border-navy/10'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading && <div className="text-center text-sm text-slate-400 py-8">Loading jobs…</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-3">💼</div>
            <p className="text-sm text-slate-600 font-medium">
              {lang === 'fr'
                ? 'Aucune opportunité disponible pour le moment.'
                : 'No opportunities available at the moment.'}
            </p>
          </div>
        )}
        {!loading && filtered.map((j) => (
          <button
            key={j.id}
            onClick={() => openDetail({ type: 'job', id: j.id })}
            className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-[0.99] transition"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy to-navy-light text-white flex items-center justify-center shrink-0">
                <BriefIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy text-sm leading-tight break-words">{j.title}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{j.postedBy}</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[j.type]}`}>{j.type}</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-0.5 min-w-0 truncate"><MapPin size={11} className="shrink-0" />{j.location}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{j.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><ClockIcon size={10} /> {j.postedAgo}</span>
                  {j.expires && (
                    <span className="text-[10px] text-crimson font-bold">{t('expires')} {new Date(j.expires).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => setSubmitOpen(true)}
          className="w-full mt-3 border-2 border-dashed border-crimson/40 text-crimson font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <PlusIcon size={18} /> {t('postOpportunity')}
        </button>
      </div>

      <ModalSheet open={submitOpen} onClose={() => setSubmitOpen(false)} title={t('postOpportunity')}>
        <SubmitJobForm user={user} onClose={() => setSubmitOpen(false)} onSuccess={() => { setSubmitOpen(false); }} />
      </ModalSheet>
    </div>
  );
}

function SubmitJobForm({ user, onClose, onSuccess }: { user: AuthUser; onClose: () => void; onSuccess: () => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    contact: '',
    expires: '',
    type: 'Full-time' as JobType,
  });

  if (user.guest || !user.id) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-600">Sign in to post an opportunity.</p>
        <button onClick={onClose} className="mt-4 text-crimson font-bold text-sm">{t('close')}</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm text-navy font-semibold">Job submitted for review!</p>
        <button onClick={onSuccess} className="mt-4 w-full bg-crimson text-white font-bold py-3 rounded-xl">{t('close')}</button>
      </div>
    );
  }

  const submit = async () => {
    if (!form.title || !form.description || !form.location || !form.contact) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    const { error: err } = await createJob({
      postedById: user.id!,
      postedByName: user.name,
      title: form.title,
      description: form.description,
      location: form.location,
      contact: form.contact,
      expires: form.expires || undefined,
      type: form.type,
      imageUrl,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess(true);
  };

  return (
    <div className="p-4 space-y-3 pb-6">
      <Field label="Job title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <Field label={t('location')} value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Field label={t('contact')} value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
      <ImageUpload folder="jobs" value={imageUrl} onChange={setImageUrl} label="Photo (optional)" />
      <Field label={t('expires')} value={form.expires} onChange={(v) => setForm({ ...form, expires: v })} type="date" />
      <label className="block">
        <span className="text-xs font-bold text-slate-600">Type</span>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as JobType })}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none"
        >
          {(['Full-time', 'Part-time', 'Contract', 'Volunteer'] as JobType[]).map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
      </label>
      {error && <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}
      <button onClick={submit} disabled={loading} className="w-full bg-crimson text-white font-bold py-3.5 rounded-xl disabled:opacity-60">
        {loading ? '…' : t('submit')}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', multiline }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none" />
      )}
    </label>
  );
}

function JobDetail({ job, onBack }: { job: Job; onBack: () => void }) {
  const { t } = useT();
  return (
    <div className="pb-6 bg-white min-h-full">
      <div className="bg-gradient-to-br from-navy to-navy-dark text-white p-4 pt-5 relative">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-white/15 text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center mt-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-2">
            <BriefIcon size={28} />
          </div>
          <h1 className="text-xl font-extrabold break-words px-2">{job.title}</h1>
          <p className="text-white/70 text-sm mt-0.5">{job.postedBy}</p>
        </div>
        <div className="flex items-center gap-2 justify-center mt-3 flex-wrap px-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-white text-navy shrink-0">{job.type}</span>
          <span className="text-xs text-white/80 flex items-center gap-1 min-w-0"><MapPin size={12} className="shrink-0" /> <span className="truncate">{job.location}</span></span>
        </div>
      </div>

      <div className="p-4">
        {job.image && <img src={job.image} alt="" className="w-full rounded-2xl object-cover max-h-48 mb-3" />}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Description</div>
          <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>
        </div>

        <div className="mt-3 bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
          <Row label={t('postedBy')} value={job.postedBy} />
          <Row label={t('location')} value={job.location} />
          {job.expires && <Row label={t('expires')} value={new Date(job.expires).toLocaleDateString()} />}
          <Row label={t('contact')} value={job.contact} />
        </div>

        <a href={`tel:${job.contact.replace(/[^0-9+]/g, '')}`} className="block w-full mt-4 bg-crimson hover:bg-crimson-dark text-white font-bold py-3.5 rounded-xl shadow-lg text-center">
          {t('apply')}
        </a>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-500 font-semibold shrink-0">{label}</span>
      <span className="text-xs text-navy font-medium text-right break-words">{value}</span>
    </div>
  );
}
