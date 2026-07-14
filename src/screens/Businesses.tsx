import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useT } from '../i18n';
import { businessCategories, cities, Business } from '../data';
import { fetchApprovedBusinesses } from '../services/businesses';
import { SearchIcon, CheckCircle, PhoneIcon, MapPin, StarIcon, PlusIcon, ChevronLeft, FilterIcon } from '../components/Icons';
import type { AuthUser } from '../types/auth';

export function Businesses({ user: _user }: { user: AuthUser }) {
  const { t } = useT();
  const { detail, openDetail, closeDetail } = useNavigation();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const selected = detail?.type === 'business' ? businesses.find((b) => b.id === detail.id) ?? null : null;

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
    return <BusinessDetail business={selected} onBack={closeDetail} />;
  }

  return (
    <div className="pb-4 w-full max-w-full min-w-0 overflow-x-hidden box-border">
      <div className="page-header px-4 pt-4 pb-3 sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-navy font-display tracking-tight">{t('businesses')}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{filtered.length} African-owned businesses</p>

        <div className="mt-3 flex items-center gap-2 bg-navy/[0.05] rounded-2xl px-3.5 py-2.5 border border-navy/[0.04]">
          <SearchIcon size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchBusiness')}
            className="flex-1 bg-transparent outline-none text-sm text-navy"
          />
        </div>

        <div className="scroll-row-x mt-3">
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
        <div className="scroll-row-x mt-2">
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
            onClick={() => openDetail({ type: 'business', id: b.id })}
            className="w-full text-left card-modern overflow-hidden flex tap-scale"
          >
            <div className={`w-24 shrink-0 bg-gradient-to-br ${b.color} flex items-center justify-center text-5xl`}>
              {b.emoji}
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <h3 className="font-bold text-navy text-sm truncate min-w-0">{b.name}</h3>
                {b.verified && <CheckCircle size={14} className="text-crimson shrink-0" />}
                {b.featured && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">⭐</span>}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">{b.category} • {b.city}</div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.description}</p>
              <div className="flex items-center gap-2 mt-1.5 min-w-0 flex-wrap">
                <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-bold shrink-0">
                  <StarIcon size={12} /> {b.rating}
                </span>
                <span className="text-[11px] text-slate-400 truncate min-w-0">• {t('owner')}: {b.owner.split(' ')[0]}</span>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => { window.location.href = '/business/register'; }}
          className="w-full mt-3 border-2 border-dashed border-crimson/40 text-crimson font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <PlusIcon size={18} /> {t('submitBusiness')}
        </button>
      </div>
    </div>
  );
}

function FilterChip({
  active, onClick, label, icon, variant = 'cat',
}: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode; variant?: 'cat' | 'city' }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
        active
          ? variant === 'city' ? 'bg-crimson text-white shadow-md shadow-crimson/25' : 'chip-active'
          : 'bg-white text-slate-600 border border-navy/10'
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
          <div className="flex items-start gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <h1 className="text-lg font-extrabold text-navy break-words">{business.name}</h1>
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

          <div className="grid grid-cols-3 gap-2 mt-4 min-w-0">
            <a href={`tel:${business.phone}`} className="bg-navy text-white rounded-xl py-2.5 flex flex-col items-center gap-0.5 min-w-0 px-1">
              <PhoneIcon size={16} />
              <span className="text-[9px] font-bold text-center leading-tight">{t('callNow')}</span>
            </a>
            <a href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white rounded-xl py-2.5 flex flex-col items-center gap-0.5 min-w-0 px-1">
              <span className="text-lg leading-none">💬</span>
              <span className="text-[9px] font-bold text-center leading-tight">{t('whatsapp')}</span>
            </a>
            <button className="bg-slate-100 text-navy rounded-xl py-2.5 flex flex-col items-center gap-0.5 min-w-0 px-1">
              <MapPin size={16} />
              <span className="text-[9px] font-bold text-center leading-tight">{t('directions')}</span>
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
    <div className="flex items-start justify-between gap-3 min-w-0">
      <span className="text-xs text-slate-500 font-semibold shrink-0">{label}</span>
      <span className="text-xs text-navy font-medium text-right break-words min-w-0">{value}</span>
    </div>
  );
}
