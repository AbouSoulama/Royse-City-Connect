import { useT } from '../i18n';
import type { AppNotification } from '../services/notifications';

const typeStyles: Record<string, { emoji: string; color: string }> = {
  alert: { emoji: '🚨', color: 'bg-red-100 text-red-700' },
  event: { emoji: '📅', color: 'bg-blue-100 text-blue-700' },
  business: { emoji: '🏪', color: 'bg-emerald-100 text-emerald-700' },
  admin: { emoji: '✅', color: 'bg-amber-100 text-amber-700' },
};

export function NotificationsList({
  notifications,
  onClose,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  const { t } = useT();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {unread > 0 ? `${unread} ${t('unreadLabel')}` : t('notifEmpty')}
        </p>
        {unread > 0 && (
          <button onClick={onMarkAllRead} className="text-xs font-bold text-crimson">{t('markAllRead')}</button>
        )}
      </div>
      <div className="space-y-2 px-3 pb-3">
        {notifications.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">{t('notifEmpty')}</div>
        )}
        {notifications.map((n) => {
          const s = typeStyles[n.type] ?? typeStyles.event;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 rounded-2xl ${n.unread ? 'bg-crimson/5 border border-crimson/15' : 'bg-white border border-slate-100'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-navy text-sm">{n.title}</h4>
                  {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-crimson" />}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-3">
        <button onClick={onClose} className="w-full text-sm font-bold text-slate-500 py-2">{t('close')}</button>
      </div>
    </div>
  );
}
