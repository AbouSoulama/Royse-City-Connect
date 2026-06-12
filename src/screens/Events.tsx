import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { Event } from '../data';
import { ModalSheet } from '../components/Layout';
import type { AuthUser } from '../types/auth';
import { ImageUpload } from '../components/ImageUpload';
import {
  createEvent,
  fetchApprovedEvents,
  fetchUserRsvpIds,
  toggleRsvp,
} from '../services/events';
import { CalIcon, MapPin, ClockIcon, ChevronLeft, CheckCircle, ShareIcon, PlusIcon } from '../components/Icons';

export function Events({ user }: { user: AuthUser }) {
  const { t } = useT();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Event | null>(null);
  const [going, setGoing] = useState<Record<string, boolean>>({});
  const [submitOpen, setSubmitOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchApprovedEvents();
    setEvents(data);
    if (user.id && !user.guest) {
      const rsvps = await fetchUserRsvpIds(user.id);
      setGoing(Object.fromEntries(rsvps.map((id) => [id, true])));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user.id]);

  const handleRsvp = async (eventId: string) => {
    if (!user.id || user.guest) return;
    const wasGoing = !!going[eventId];
    setGoing({ ...going, [eventId]: !wasGoing });
    const { error } = await toggleRsvp(eventId, user.id, wasGoing);
    if (error) {
      setGoing({ ...going, [eventId]: wasGoing });
      return;
    }
    await load();
    if (selected?.id === eventId) {
      const updated = (await fetchApprovedEvents()).find((e) => e.id === eventId);
      if (updated) setSelected(updated);
    }
  };

  if (selected) {
    return (
      <EventDetail
        event={selected}
        onBack={() => setSelected(null)}
        isGoing={!!going[selected.id]}
        onRsvp={() => handleRsvp(selected.id)}
        canRsvp={!user.guest && !!user.id}
      />
    );
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const featured = sorted.filter((e) => e.featured);

  return (
    <div className="pb-4">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100">
        <h1 className="text-xl font-extrabold text-navy">{t('events')}</h1>
        <p className="text-xs text-slate-500">{sorted.length} community events</p>
      </div>

      {loading && <div className="text-center text-sm text-slate-400 py-8">Loading events…</div>}

      {!loading && featured[0] && (
        <div className="p-4">
          <button
            onClick={() => setSelected(featured[0])}
            className="block w-full text-left rounded-2xl overflow-hidden shadow-lg active:scale-[0.99] transition"
          >
            <div className={`h-44 bg-gradient-to-br ${featured[0].color} flex items-center justify-center text-7xl relative`}>
              <span className="absolute top-3 left-3 bg-white/90 text-crimson text-[10px] font-bold px-2 py-1 rounded-full">⭐ FEATURED</span>
              {featured[0].emoji}
            </div>
            <div className="bg-white p-3">
              <div className="text-[10px] font-bold text-crimson uppercase">
                {fullDate(featured[0].date)} • {featured[0].time}
              </div>
              <h3 className="font-extrabold text-navy mt-0.5">{featured[0].title}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin size={12} /> {featured[0].location}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-bold">{featured[0].attendees}</span> attendees
              </div>
            </div>
          </button>
        </div>
      )}

      <div className="px-4 space-y-3">
        {!loading && sorted.filter((e) => e.id !== featured[0]?.id).map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex gap-3 active:scale-[0.99] transition"
          >
            <div className={`w-16 shrink-0 rounded-xl bg-gradient-to-br ${e.color} flex flex-col items-center justify-center text-white py-2`}>
              <span className="text-[10px] font-bold uppercase">{monthShort(e.date)}</span>
              <span className="text-2xl font-extrabold leading-none">{day(e.date)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xl">{e.emoji}</span>
                <h3 className="font-bold text-navy text-sm truncate">{e.title}</h3>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <ClockIcon size={11} /> {e.time}
                <span className="mx-1">•</span>
                <MapPin size={11} /> <span className="truncate">{e.city}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{e.description}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-slate-400">{t('organizedBy')} <span className="font-semibold text-navy">{e.organizer}</span></span>
                <span className="text-[11px] font-bold text-emerald-600">{e.attendees} going</span>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => setSubmitOpen(true)}
          className="w-full mt-3 border-2 border-dashed border-crimson/40 text-crimson font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <PlusIcon size={18} /> Create event
        </button>
      </div>

      <ModalSheet open={submitOpen} onClose={() => setSubmitOpen(false)} title="Create event">
        <SubmitEventForm user={user} onClose={() => setSubmitOpen(false)} onSuccess={() => { setSubmitOpen(false); load(); }} />
      </ModalSheet>
    </div>
  );
}

function SubmitEventForm({ user, onClose, onSuccess }: { user: AuthUser; onClose: () => void; onSuccess: () => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00 AM',
    location: '',
    city: user.city || 'Royse City',
  });

  if (user.guest || !user.id) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-600">Sign in to create an event.</p>
        <button onClick={onClose} className="mt-4 text-crimson font-bold text-sm">{t('close')}</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm text-navy font-semibold">Event submitted for review!</p>
        <button onClick={onSuccess} className="mt-4 w-full bg-crimson text-white font-bold py-3 rounded-xl">{t('close')}</button>
      </div>
    );
  }

  const submit = async () => {
    if (!form.title || !form.description || !form.date || !form.location) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    const { error: err } = await createEvent({
      organizerId: user.id!,
      organizerName: user.name,
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      city: form.city,
      imageUrl,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess(true);
  };

  return (
    <div className="p-4 space-y-3 pb-6">
      <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
      <Field label={t('when')} value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
      <Field label={t('where')} value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Field label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
      <ImageUpload folder="events" value={imageUrl} onChange={setImageUrl} label="Event photo (optional)" />
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

function EventDetail({
  event, onBack, isGoing, onRsvp, canRsvp,
}: {
  event: Event; onBack: () => void; isGoing: boolean; onRsvp: () => void; canRsvp: boolean;
}) {
  const { t } = useT();
  return (
    <div className="pb-6">
      <div className={`h-56 relative flex items-center justify-center overflow-hidden ${event.image ? '' : `bg-gradient-to-br ${event.color}`}`}>
        {event.image ? (
          <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-8xl drop-shadow-2xl">{event.emoji}</span>
        )}
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-white/90 text-navy z-10">
          <ChevronLeft size={20} />
        </button>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-navy z-10">
          <ShareIcon size={20} />
        </button>
      </div>

      <div className="p-4 -mt-8 relative">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
          <div className="text-[11px] font-bold text-crimson uppercase">{fullDate(event.date)} • {event.time}</div>
          <h1 className="text-xl font-extrabold text-navy mt-1">{event.title}</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{event.description}</p>
          <div className="mt-4 space-y-2">
            <InfoRow icon={<CalIcon size={16} />} label={t('when')} value={`${fullDate(event.date)} at ${event.time}`} />
            <InfoRow icon={<MapPin size={16} />} label={t('where')} value={event.location} />
            <InfoRow icon={<span>👥</span>} label={t('organizedBy')} value={event.organizer} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={canRsvp ? onRsvp : undefined}
            disabled={!canRsvp}
            className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50 ${
              isGoing ? 'bg-emerald-600 text-white' : 'bg-crimson text-white'
            }`}
          >
            {isGoing ? <><CheckCircle size={16} /> {t('going')}</> : t('rsvp')}
          </button>
          <button className="py-3 rounded-xl font-bold text-sm bg-slate-100 text-navy flex items-center justify-center gap-1">
            <CalIcon size={16} /> {t('addToCalendar')}
          </button>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4">
          <div className="text-xs font-bold text-slate-500 mb-2">ATTENDEES ({event.attendees})</div>
          <div className="flex -space-x-2">
            {['🧑🏾', '👩🏾', '🧑🏽', '👨🏾', '👩🏿'].map((e, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-lg">{e}</div>
            ))}
            {event.attendees > 5 && (
              <div className="w-9 h-9 rounded-full bg-navy text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">
                +{event.attendees - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 text-navy flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
        <div className="text-sm text-navy font-semibold">{value}</div>
      </div>
    </div>
  );
}

function fullDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}
function monthShort(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' });
}
function day(d: string) {
  return new Date(d + 'T12:00:00').getDate();
}
