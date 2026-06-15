import { useEffect, useState } from 'react';
import { useT, Lang } from '../i18n';
import { AuthUser } from '../types/auth';
import { ImageUpload } from '../components/ImageUpload';
import { ModalSheet } from '../components/Layout';
import { fetchUserStats, updateProfile } from '../services/profile';
import { fetchSavedItemIds, savedCount } from '../services/savedItems';
import { getProfileSettings, saveProfileSettings, ProfileSettings } from '../utils/profileSettings';
import { fetchCommunityFeed } from '../services/posts';
import { Post } from '../data';
import { PostDetailSheet } from '../components/Posts';
import { FeedbackSheet } from '../components/FeedbackSheet';
import {
  SettingsIcon, BellIcon, GlobeIcon, BookmarkIcon, ShieldIcon, HelpIcon,
  LogoutIcon, ChevronRight, StoreIcon, ChevronLeft, UserIcon, StarIcon
} from '../components/Icons';

type Panel = 'saved' | 'settings' | 'privacy' | 'help' | 'edit' | 'feedback' | null;
type ProfileTab = 'posts' | 'events' | 'saved' | 'about';

const CITIES = ['Royse City', 'Dallas', 'Rockwall', 'Garland', 'Plano', 'Other'];

export function Profile({
  user, onBack, onSignOut, onOpenAdmin, onOpenNotifs, onOpenFeedback, onProfileUpdated, lang, setLang,
}: {
  user: AuthUser;
  onBack: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
  onOpenNotifs: () => void;
  onOpenFeedback?: () => void;
  onProfileUpdated: () => Promise<void>;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const { t } = useT();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [panel, setPanel] = useState<Panel>(null);
  const [tab, setTab] = useState<ProfileTab>('about');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedTotal, setSavedTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>(getProfileSettings);
  const [stats, setStats] = useState({ posts: 0, events: 0 });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editCity, setEditCity] = useState(user.city);
  const [editBio, setEditBio] = useState(user.bio ?? '');

  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const memberDate = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
    : '—';

  useEffect(() => {
    if (user.id && !user.guest) {
      fetchUserStats(user.id).then(setStats);
    }
  }, [user.id, user.guest]);

  useEffect(() => {
    savedCount(user.guest ? undefined : user.id).then(setSavedTotal);
  }, [user.id, user.guest, panel, tab]);

  useEffect(() => {
    if (panel === 'saved' || tab === 'saved') {
      fetchSavedItemIds(user.guest ? undefined : user.id).then(async (items) => {
        const feed = await fetchCommunityFeed();
        const ids = new Set(items.map((i) => i.id));
        setSavedPosts(feed.filter((p) => {
          const rawId = p.sourceId ?? p.id;
          return ids.has(rawId) || ids.has(p.id);
        }));
      });
    }
  }, [panel, tab, user.id, user.guest]);

  useEffect(() => {
    setAvatarUrl(user.avatarUrl);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditCity(user.city);
    setEditBio(user.bio ?? '');
  }, [user]);

  const updateSettings = (patch: Partial<ProfileSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveProfileSettings(next);
  };

  const handleSaveProfile = async () => {
    if (!user.id || user.guest) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await updateProfile(user.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      city: editCity,
      bio: editBio.trim() || undefined,
      avatar_url: avatarUrl,
    });
    setSaving(false);
    if (error) {
      setSaveMsg(error);
      return;
    }
    await onProfileUpdated();
    setSaveMsg(t('saved'));
    setTimeout(() => { setPanel(null); setSaveMsg(''); }, 800);
  };

  const displayPhone = settings.showPhone ? user.phone : null;
  const displayEmail = settings.showEmail ? user.email : null;

  return (
    <div className="pb-4 bg-slate-50">
      <div className="bg-gradient-to-br from-navy via-navy-dark to-navy-light text-white px-4 pt-4 pb-8 rounded-b-3xl relative">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-white/15 z-10">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => !user.guest && user.id && setPanel('edit')}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-crimson to-crimson-dark border-4 border-white/20 flex items-center justify-center text-2xl font-extrabold shadow-xl overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials || '👤'
            )}
          </button>
          <p className="text-[10px] text-white/60 mt-2">{t('editProfile')}</p>
          <h1 className="text-lg font-extrabold mt-2">{user.name}</h1>
          <div className="text-white/70 text-xs mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
            {displayPhone && <span>{displayPhone}</span>}
            {displayPhone && displayEmail && <span>•</span>}
            {displayEmail && <span>{displayEmail}</span>}
            {!displayPhone && !displayEmail && !user.guest && (
              <span className="text-white/50">{user.city}</span>
            )}
            {user.guest && <span>Guest</span>}
          </div>
          <div className="mt-3 inline-flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold uppercase text-crimson-light">
              {user.role === 'admin' ? '🛡️ Admin' : user.role === 'business' ? '🏪 Business' : '👤 Member'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-[10px] font-bold">{user.city}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 grid grid-cols-4 divide-x divide-slate-100">
          <TabBtn label={t('posts')} value={String(stats.posts)} active={tab === 'posts'} onClick={() => setTab('posts')} />
          <TabBtn label={t('eventsLabel')} value={String(stats.events)} active={tab === 'events'} onClick={() => setTab('events')} />
          <TabBtn label="Saved" value={String(savedTotal)} active={tab === 'saved'} onClick={() => setTab('saved')} />
          <TabBtn label={t('about')} value="ℹ️" active={tab === 'about'} onClick={() => setTab('about')} />
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-navy">{t('about')}</h3>
              {!user.guest && (
                <button onClick={() => setPanel('edit')} className="text-xs font-bold text-crimson">{t('edit')}</button>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {user.bio || t('noBio')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between"><span>{t('memberSince')}</span><span className="font-semibold text-navy">{memberDate}</span></div>
              <div className="flex justify-between"><span>{t('city')}</span><span className="font-semibold text-navy">{user.city}</span></div>
              {user.email && <div className="flex justify-between"><span>Email</span><span className="font-semibold text-navy truncate ml-4">{user.email}</span></div>}
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <TabContent empty={stats.posts === 0} emptyText="No posts yet. Share news from the Home or News tab.">
            <p className="text-sm text-slate-600">{stats.posts} post{stats.posts !== 1 ? 's' : ''} published</p>
          </TabContent>
        )}

        {tab === 'events' && (
          <TabContent empty={stats.events === 0} emptyText="No events joined yet. RSVP from the Events tab.">
            <p className="text-sm text-slate-600">{stats.events} event{stats.events !== 1 ? 's' : ''} joined</p>
          </TabContent>
        )}

        {tab === 'saved' && (
          <div className="space-y-2">
            {savedPosts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8 bg-white rounded-2xl border border-slate-100">No saved items yet.</p>
            )}
            {savedPosts.map((p) => (
              <button key={p.id} onClick={() => setSelectedPost(p)} className="w-full text-left bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <div className="font-bold text-navy text-sm">{p.title}</div>
                <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.body}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-[10px] font-bold text-slate-400 uppercase px-5 mt-5 mb-2">{t('feedbackSection')}</div>
      <div className="px-4 mb-1">
        <button
          type="button"
          onClick={() => (onOpenFeedback ? onOpenFeedback() : setPanel('feedback'))}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <StarIcon size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-navy text-sm">{t('giveFeedback')}</div>
            <div className="text-xs text-slate-500">{t('feedbackCardDesc')}</div>
          </div>
          <ChevronRight size={16} className="text-amber-600" />
        </button>
      </div>

      <div className="text-[10px] font-bold text-slate-400 uppercase px-5 mt-5 mb-2">{t('myActivity')}</div>
      <div className="bg-white border-y border-slate-100">
        <Item icon={<BookmarkIcon size={18} />} label={t('mySavedItems')} value={String(savedTotal)} onClick={() => setTab('saved')} />
        {user.role === 'business' && (
          <Item icon={<StoreIcon size={18} />} label={t('myBusinesses')} value="—" onClick={() => {}} />
        )}
        <Item icon={<BellIcon size={18} />} label={t('notifications')} value={settings.pushNotifications ? 'On' : 'Off'} onClick={onOpenNotifs} />
      </div>

      <div className="text-[10px] font-bold text-slate-400 uppercase px-5 mt-5 mb-2">{t('settings')}</div>
      <div className="bg-white border-y border-slate-100">
        <Item icon={<UserIcon size={18} />} label={t('editProfile')} onClick={() => setPanel('edit')} />
        <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-navy flex items-center justify-center">
            <GlobeIcon size={18} />
          </div>
          <span className="flex-1 text-sm font-semibold text-navy">{t('language')}</span>
          <div className="flex gap-1 bg-slate-100 rounded-full p-1">
            <button onClick={() => setLang('en')} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${lang === 'en' ? 'bg-navy text-white' : 'text-slate-500'}`}>EN</button>
            <button onClick={() => setLang('fr')} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${lang === 'fr' ? 'bg-navy text-white' : 'text-slate-500'}`}>FR</button>
          </div>
        </div>
        <Item icon={<SettingsIcon size={18} />} label={t('settings')} onClick={() => setPanel('settings')} />
        <Item icon={<ShieldIcon size={18} />} label={t('privacy')} onClick={() => setPanel('privacy')} />
        <Item icon={<HelpIcon size={18} />} label={t('helpSupport')} onClick={() => setPanel('help')} />
        {user.role === 'admin' && (
          <Item icon={<ShieldIcon size={18} className="text-crimson" />} label={t('adminDashboard')} onClick={onOpenAdmin} highlight />
        )}
      </div>

      <div className="px-4 mt-6">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="w-full bg-white border border-crimson/20 text-crimson font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-crimson/5"
        >
          <LogoutIcon size={18} /> {t('signOut')}
        </button>
      </div>

      <ModalSheet open={logoutOpen} onClose={() => setLogoutOpen(false)} title={t('signOutConfirmTitle')}>
        <div className="p-4 pb-8 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{t('signOutConfirmMessage')}</p>
          <button
            type="button"
            onClick={() => { setLogoutOpen(false); onSignOut(); }}
            className="w-full bg-crimson text-white font-bold py-3.5 rounded-xl shadow-lg shadow-crimson/20"
          >
            {t('signOutConfirmYes')}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(false)}
            className="w-full bg-slate-100 text-navy font-bold py-3.5 rounded-xl"
          >
            {t('signOutConfirmCancel')}
          </button>
        </div>
      </ModalSheet>

      <ModalSheet open={panel === 'edit'} onClose={() => setPanel(null)} title={t('editProfile')}>
        <div className="p-4 pb-6 space-y-4">
          <ImageUpload
            folder="avatars"
            value={avatarUrl}
            onChange={(url) => setAvatarUrl(url)}
            label={t('profilePhoto')}
          />
          <Field label={t('fullName')} value={editName} onChange={setEditName} />
          <Field label={t('phone')} value={editPhone} onChange={setEditPhone} type="tel" />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">{t('city')}</label>
            <select
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-navy bg-white"
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">{t('bio')}</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder={t('bioPlaceholder')}
              rows={4}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-navy resize-none"
            />
          </div>
          {user.email && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input value={user.email} disabled className="mt-1 w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-50" />
            </div>
          )}
          {saveMsg && <p className={`text-sm text-center ${saveMsg === t('saved') ? 'text-green-600' : 'text-crimson'}`}>{saveMsg}</p>}
          <button
            onClick={handleSaveProfile}
            disabled={saving || user.guest}
            className="w-full bg-navy text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {saving ? '…' : t('saveChanges')}
          </button>
        </div>
      </ModalSheet>

      <ModalSheet open={panel === 'settings'} onClose={() => setPanel(null)} title={t('settings')}>
        <div className="p-4 pb-6 space-y-1">
          <SettingsToggle
            label={t('pushNotifications')}
            value={settings.pushNotifications}
            onChange={(v) => updateSettings({ pushNotifications: v })}
          />
          <SettingsToggle
            label={t('showPhone')}
            value={settings.showPhone}
            onChange={(v) => updateSettings({ showPhone: v })}
          />
          <SettingsToggle
            label={t('showEmail')}
            value={settings.showEmail}
            onChange={(v) => updateSettings({ showEmail: v })}
          />
          <div className="pt-4 mt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('account')}</div>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-semibold text-navy">{user.name}</span></p>
              {user.email && <p className="text-xs">{user.email}</p>}
              <p className="text-xs text-slate-400">{t('memberSince')} {memberDate}</p>
            </div>
          </div>
          <div className="pt-3 text-xs text-slate-400">{t('appVersion')} 1.0.0</div>
        </div>
      </ModalSheet>

      <ModalSheet open={panel === 'saved'} onClose={() => setPanel(null)} title={t('mySavedItems')}>
        <div className="p-4 pb-6 space-y-2">
          {savedPosts.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No saved items yet.</p>}
          {savedPosts.map((p) => (
            <button key={p.id} onClick={() => setSelectedPost(p)} className="w-full text-left bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="font-bold text-navy text-sm">{p.title}</div>
              <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.body}</div>
            </button>
          ))}
        </div>
      </ModalSheet>

      <InfoPanel open={panel === 'privacy'} onClose={() => setPanel(null)} title={t('privacy')}>
        <p>Your profile data is stored securely on Supabase. Phone and email visibility can be controlled in Settings.</p>
        <p className="mt-3">We never share your information with third parties without your consent. Contact the admin for data deletion requests.</p>
      </InfoPanel>

      <InfoPanel open={panel === 'help'} onClose={() => setPanel(null)} title={t('helpSupport')}>
        <p>Email: support@rcconnect.app</p>
        <p className="mt-2">Phone: +1 (469) 555-0100</p>
        <p className="mt-2">Community help available in English and French.</p>
      </InfoPanel>

      <FeedbackSheet
        open={panel === 'feedback'}
        onClose={() => setPanel(null)}
        userId={user.id}
        userName={user.name}
      />

      <PostDetailSheet post={selectedPost} open={!!selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
}

function TabBtn({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`py-3 text-center transition-colors ${active ? 'bg-navy/5' : 'hover:bg-slate-50'}`}>
      <div className={`text-lg font-extrabold ${active ? 'text-navy' : 'text-navy/80'}`}>{value}</div>
      <div className={`text-[9px] uppercase font-bold tracking-wide ${active ? 'text-crimson' : 'text-slate-500'}`}>{label}</div>
    </button>
  );
}

function TabContent({ children, empty, emptyText }: { children: React.ReactNode; empty: boolean; emptyText: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      {empty ? <p className="text-sm text-slate-400 text-center py-4">{emptyText}</p> : children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-navy"
      />
    </div>
  );
}

function SettingsToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <span className="text-sm font-semibold text-navy">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-navy' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function Item({ icon, label, value, onClick, highlight }: {
  icon: React.ReactNode; label: string; value?: string; onClick?: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 active:bg-slate-100 ${highlight ? 'bg-crimson/5' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl ${highlight ? 'bg-crimson/10 text-crimson' : 'bg-slate-100 text-navy'} flex items-center justify-center`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm font-semibold text-left ${highlight ? 'text-crimson' : 'text-navy'}`}>{label}</span>
      {value && <span className="text-xs text-slate-400 font-medium">{value}</span>}
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}

function InfoPanel({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <ModalSheet open={open} onClose={onClose} title={title}>
      <div className="p-4 pb-6 text-sm text-slate-600 leading-relaxed">{children}</div>
    </ModalSheet>
  );
}
