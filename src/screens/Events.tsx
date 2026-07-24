import { useEffect, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useT } from '../i18n';
import { Event } from '../data';
import { ModalSheet, ListSkeleton } from '../components/Layout';
import type { AuthUser } from '../types/auth';
import { ImageUpload } from '../components/ImageUpload';
import {
  createEvent,
  fetchApprovedEvents,
  fetchUserRsvpIds,
  toggleRsvp,
} from '../services/events';
import { CalIcon, MapPin, ClockIcon, ChevronLeft, CheckCircle, ShareIcon, PlusIcon } from '../components/Icons';
import { shareItem } from '../lib/share';

export function Events({ user }: { user: AuthUser }) {
  const { t } = useT();
  const { detail, openDetail, closeDetail } = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [going, setGoing] = useState<Record<string, boolean>>({});
  const [submitOpen, setSubmitOpen] = useState(false);

  const selected = detail?.type === 'event' ? events.find((e) => e.id === detail.id) ?? null : null;

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
  };

  if (selected) {
    return (
      <EventDetail
        event={selected}
        onBack={closeDetail}
        isGoing={!!going[selected.id]}
        onRsvp={() => handleRsvp(selected.id)}
        canRsvp={!user.guest && !!user.id}
      />
    );
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const featured = sorted.filter((e) => e.featured);

  return (
    <div className="pb-4 w-full max-w-full min-w-0 overflow-x-clip box-border">
      <div className="page-header px-4 pt-4 pb-3">
        <h1 className="text-xl font-extrabold text-navy font-display tracking-tight">{t('events')}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{sorted.length} {t('communityEvents')}</p>
      </div>

      {loading && <div className="p-4"><ListSkeleton count={5} /></div>}

      {!loading && featured[0] && (
        <div className="p-4">
          <button
            onClick={() => openDetail({ type: 'event', id: featured[0].id })}
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
              <h3 className="font-extrabold text-navy mt-0.5 line-clamp-2">{featured[0].title}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 min-w-0">
                <MapPin size={12} className="shrink-0" /> <span className="truncate">{featured[0].location}</span>
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
            onClick={() => openDetail({ type: 'event', id: e.id })}
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
              <div className="flex items-center justify-between mt-1.5 gap-2 min-w-0">
                <span className="text-[11px] text-slate-400 min-w-0 truncate">
                  {t('organizedBy')} <span className="font-semibold text-navy">{e.organizer}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-600 shrink-0 whitespace-nowrap">{e.attendees} going</span>
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => setSubmitOpen(true)}
          className="w-full mt-3 border-2 border-dashed border-crimson/40 text-crimson font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <PlusIcon size={18} /> {t('createEvent')}
        </button>
      </div>

      <ModalSheet open={submitOpen} onClose={() => setSubmitOpen(false)} title={t('createEvent')}>
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
        <p className="text-sm text-slate-600">{t('signInToCreateEvent')}</p>
        <button onClick={onClose} className="mt-4 text-crimson font-bold text-sm">{t('close')}</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm text-navy font-semibold">{t('eventSubmitted')}</p>
        <button onClick={onSuccess} className="mt-4 w-full bg-crimson text-white font-bold py-3 rounded-xl">{t('close')}</button>
      </div>
    );
  }

  const submit = async () => {
    if (!form.title || !form.description || !form.date || !form.location) {
      setError(t('fillRequired'));
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
      <Field label={t('fieldTitle')} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label={t('fieldDescription')} value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
      <Field label={t('when')} value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
      <Field label={t('where')} value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Field label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
      <ImageUpload folder="events" value={imageUrl} onChange={setImageUrl} label={t('eventPhotoOptional')} />
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
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-white/90 text-navy z-10 tap-scale shadow-md">
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => {
            shareItem({ title: event.title, text: `${event.title} — ${fullDate(event.date)} · ${event.location}`, itemId: event.id, type: 'event' }).catch(() => {});
          }}
          aria-label={t('share')}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-navy z-10 tap-scale shadow-md"
        >
          <ShareIcon size={20} />
        </button>
      </div>

      <div className="p-4 -mt-8 relative">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
          <div className="text-[11px] font-bold text-crimson uppercase">{fullDate(event.date)} • {event.time}</div>
          <h1 className="text-xl font-extrabold text-navy mt-1 break-words">{event.title}</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{event.description}</p>
          <div className="mt-4 space-y-2">
            <InfoRow icon={<CalIcon size={16} />} label={t('when')} value={`${fullDate(event.date)} at ${event.time}`} />
            <InfoRow icon={<MapPin size={16} />} label={t('where')} value={event.location} />
            <InfoRow icon={<span>👥</span>} label={t('organizedBy')} value={event.organizer} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 min-w-0">
          <button
            onClick={canRsvp ? onRsvp : undefined}
            disabled={!canRsvp}
            className={`py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-50 min-w-0 ${
              isGoing ? 'bg-emerald-600 text-white' : 'bg-crimson text-white'
            }`}
          >
            {isGoing ? <><CheckCircle size={16} /> {t('going')}</> : t('rsvp')}
          </button>
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-navy flex items-center justify-center gap-1 min-w-0 tap-scale transition-colors"
          >
            <CalIcon size={16} /> <span className="truncate">{t('addToCalendar')}</span>
          </a>
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
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
        <div className="text-sm text-navy font-semibold break-words">{value}</div>
      </div>
    </div>
  );
}

/** Parse a "10:00 AM" / "14:30" style string into { h, m } (24h). */
function parseTime(time: string): { h: number; m: number } {
  const t = (time || '').trim();
  const match = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return { h: 9, m: 0 };
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const mer = match[3]?.toLowerCase();
  if (mer === 'pm' && h < 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;
  return { h: Math.min(h, 23), m: Math.min(m, 59) };
}

/** Build a Google Calendar "add event" URL (2h default duration). */
function googleCalendarUrl(event: Event): string {
  const { h, m } = parseTime(event.time);
  const start = new Date(`${event.date}T00:00:00`);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description || '',
    location: event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
