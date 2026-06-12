import { useEffect, useMemo, useState } from 'react';
import { useT } from '../i18n';
import { businessCategories, cities, Business } from '../data';
import { ModalSheet } from '../components/Layout';
import { ImageUpload } from '../components/ImageUpload';
import { createBusiness, fetchApprovedBusinesses } from '../services/businesses';
import { SearchIcon, CheckCircle, PhoneIcon, MapPin, StarIcon, PlusIcon, ChevronLeft, FilterIcon } from '../components/Icons';
import type { AuthUser } from '../types/auth';

export function Businesses({ user }: { user: AuthUser }) {
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [selected, setSelected] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);

  const load = () => {
    setLoading(true);
    fetchApprovedBusinesses().then((data) => {
      setBusinesses(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (cat && b.category !== cat) return false;
      if (city && b.city !== city) return false;
      if (search && !(b.name + b.description + b.category).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [businesses, search, cat, city]);

  if (selected) {
    return <BusinessDetail business={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="pb-4">
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-slate-100">
        <h1 className="text-xl font-extrabold text-navy">{t('businesses')}</h1>
        <p className="text-xs text-slate-500">{filtered.length} African-owned businesses</p>

        <div className="mt-3 flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5">
          <SearchIcon size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchBusiness')}
            className="flex-1 bg-transparent outline-none text-sm text-navy"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto phone-scroll -mx-4 px-4">
          <FilterChip
            active={!cat && !city}
            onClick={() => { setCat(null); setCity(null); }}
            label={t('catAll')}
            icon={<FilterIcon size={12} />}
          />
          {businessCategories.slice(0, 6).map((c) => (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)} label={c} />
          ))}
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto phone-scroll -mx-4 px-4">
          {cities.slice(0, 5).map((c) => (
            <FilterChip
              key={c}
              active={city === c}
              onClick={() => setCity(city === c ? null : c)}
              label={c}
              icon={<MapPin size={11} />}
              variant="city"
            />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center text-sm text-slate-400 py-8">Loading businesses…</div>
        )}
        {!loading && filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b)}
            className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex active:scale-[0.99] transition"
          >
            <div className={`w-24 shrink-0 bg-gradient-to-br ${b.color} flex items-center justify-center text-5xl`}>
              {b.emoji}
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-navy text-sm truncate">{b.name}</h3>
                {b.verified && <CheckCircle size={14} className="text-crimson shrink-0" />}
                {b.featured && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">⭐</span>}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{b.category} • {b.city}</div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-bold">
                  <StarIcon size={12} /> {b.rating}
                </span>
                <span className="text-[11px] text-slate-400">• {t('owner')}: {b.owner.split(' ')[0]}</span>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => setSubmitOpen(true)}
          className="w-full mt-3 border-2 border-dashed border-crimson/40 text-crimson font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <PlusIcon size={18} /> {t('submitBusiness')}
        </button>
      </div>

      <ModalSheet open={submitOpen} onClose={() => setSubmitOpen(false)} title={t('submitBusiness')}>
        <SubmitBusinessForm
          user={user}
          onClose={() => setSubmitOpen(false)}
          onSuccess={() => {
            setSubmitOpen(false);
            load();
          }}
        />
      </ModalSheet>
    </div>
  );
}

function SubmitBusinessForm({
  user, onClose, onSuccess,
}: {
  user: AuthUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [form, setForm] = useState({
    name: '',
    category: businessCategories[0],
    description: '',
    phone: user.phone || '',
    whatsapp: '',
    city: user.city || 'Royse City',
    address: '',
  });

  if (user.guest || !user.id) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-600">Sign in to submit your business listing.</p>
        <button onClick={onClose} className="mt-4 text-crimson font-bold text-sm">{t('close')}</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm text-navy font-semibold">Business submitted!</p>
        <p className="text-xs text-slate-500 mt-1">An admin will review your listing before it goes live.</p>
        <button onClick={onSuccess} className="mt-4 w-full bg-crimson text-white font-bold py-3 rounded-xl">{t('close')}</button>
      </div>
    );
  }

  const submit = async () => {
    setError(null);
    if (!form.name || !form.description || !form.phone) {
      setError('Name, description and phone are required.');
      return;
    }

    setLoading(true);
    const { error: err } = await createBusiness({
      ownerId: user.id!,
      ownerName: user.name,
      name: form.name,
      category: form.category,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp || undefined,
      city: form.city,
      address: form.address || undefined,
      imageUrl,
    });
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="p-4 space-y-3 pb-6">
      <FormField label="Business name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <label className="block">
        <span className="text-xs font-bold text-slate-600">{t('filterCategory')}</span>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy outline-none"
        >
          {businessCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <FormField label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
      <FormField label={t('whatsapp')} value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} type="tel" />
      <FormField label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
      <FormField label={t('location')} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
      <ImageUpload folder="businesses" value={imageUrl} onChange={setImageUrl} label="Cover photo (optional)" />

      {error && (
        <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-crimson hover:bg-crimson-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-xl"
      >
        {loading ? '…' : t('submit')}
      </button>
    </div>
  );
}

function FormField({
  label, value, onChange, type = 'text', multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy outline-none text-sm text-slate-800 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy outline-none text-sm text-slate-800"
        />
      )}
    </label>
  );
}

function FilterChip({
  active, onClick, label, icon, variant = 'cat',
}: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode; variant?: 'cat' | 'city' }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
        active
          ? variant === 'city' ? 'bg-crimson text-white' : 'bg-navy text-white'
          : 'bg-white text-slate-600 border border-slate-200'
      }`}
    >
      {icon}{label}
    </button>
  );
}

function BusinessDetail({ business, onBack }: { business: Business; onBack: () => void }) {
  const { t } = useT();
  return (
    <div className="pb-6">
      <div className={`h-44 relative flex items-center justify-center overflow-hidden ${business.image ? '' : `bg-gradient-to-br ${business.color}`}`}>
        {business.image ? (
          <img src={business.image} alt={business.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-7xl drop-shadow-lg">{business.emoji}</span>
        )}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/90 text-navy backdrop-blur z-10"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="p-4 -mt-6 relative">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-extrabold text-navy">{business.name}</h1>
                {business.verified && (
                  <span className="flex items-center gap-1 bg-crimson/10 text-crimson text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle size={11} /> {t('verified')}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{business.category} • {business.city}</div>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <StarIcon size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-700">{business.rating}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{business.description}</p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <a href={`tel:${business.phone}`} className="bg-navy text-white rounded-xl py-2.5 flex flex-col items-center gap-0.5">
              <PhoneIcon size={16} />
              <span className="text-[10px] font-bold">{t('callNow')}</span>
            </a>
            <a href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white rounded-xl py-2.5 flex flex-col items-center gap-0.5">
              <span className="text-lg leading-none">💬</span>
              <span className="text-[10px] font-bold">{t('whatsapp')}</span>
            </a>
            <button className="bg-slate-100 text-navy rounded-xl py-2.5 flex flex-col items-center gap-0.5">
              <MapPin size={16} />
              <span className="text-[10px] font-bold">{t('directions')}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <Row label={t('owner')} value={business.owner} />
          <Row label={t('phone')} value={business.phone} />
          {business.address && <Row label={t('location')} value={business.address} />}
          <Row label={t('addedOn')} value={new Date(business.createdAt).toLocaleDateString()} />
        </div>

        {business.image && (
          <>
            <h3 className="text-sm font-extrabold text-navy mt-5 mb-2">{t('gallery')}</h3>
            <img src={business.image} alt={business.name} className="w-full rounded-xl object-cover max-h-48" />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 font-semibold">{label}</span>
      <span className="text-xs text-navy font-medium text-right">{value}</span>
    </div>
  );
}
