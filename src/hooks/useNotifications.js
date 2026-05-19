// useNotifications — central hook for notification state.
// Powers NotificationBell and Notifications page.
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 30000;

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await apiFetch('/notifications');
      if (!mountedRef.current) return;
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
      setError(null);
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/notifications/unread-count');
      if (!mountedRef.current) return;
      setUnreadCount(data.unread_count || 0);
    } catch (err) {}
  }, [isAuthenticated]);

  const markRead = useCallback(async (id) => {
    if (!isAuthenticated) return;
    let rb, rc;
    setNotifications(prev => { rb = prev; return prev.map(n => (n.id === id ? { ...n, is_read: true } : n)); });
    setUnreadCount(c => { rc = c; return Math.max(0, c - 1); });
    try {
      await apiFetch('/notifications/' + id + '/read', { method: 'PATCH' });
    } catch (err) {
      if (mountedRef.current) { setNotifications(rb); setUnreadCount(rc); }
    }
  }, [isAuthenticated]);

  const markAllRead = useCallback(async () => {
    if (!isAuthenticated) return;
    let rb, rc;
    setNotifications(prev => { rb = prev; return prev.map(n => ({ ...n, is_read: true })); });
    setUnreadCount(c => { rc = c; return 0; });
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
    } catch (err) {
      if (mountedRef.current) { setNotifications(rb); setUnreadCount(rc); }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]); setUnreadCount(0); setLoading(false);
      return;
    }
    fetchUnreadCount();
    const intervalId = setInterval(() => { if (!document.hidden) fetchUnreadCount(); }, POLL_INTERVAL_MS);
    const handleFocus = () => fetchUnreadCount();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  return { notifications, unreadCount, loading, error, fetchAll, fetchUnreadCount, markRead, markAllRead };
}
