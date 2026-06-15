import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
} from '../services/notifications';

export function useNotifications(userId?: string, guest?: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(userId && !guest));

  const reload = useCallback(async () => {
    if (guest || !userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const data = await fetchNotifications(userId);
    setNotifications(data);
    setLoading(false);
  }, [userId, guest]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!userId || guest || !isSupabaseConfigured) return;

    const channel = getSupabase()
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => reload()
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [userId, guest, reload]);

  const markAllRead = async () => {
    if (!userId || guest) return;
    await markAllNotificationsRead(userId);
    await reload();
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount, loading, markAllRead, reload };
}
