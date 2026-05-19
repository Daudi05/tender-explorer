import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '../utils/icons';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import './NotificationBell.css';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const { notifications, unreadCount, loading, fetchAll, markRead, markAllRead } = useNotifications();

  useEffect(() => { if (open) fetchAll(); }, [open, fetchAll]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);
  const recent = notifications.slice(0, 5);

  return (
    <div className="notification-bell" ref={containerRef}>
      <button ref={buttonRef} type="button" className="notification-bell-button"
        onClick={() => setOpen(o => !o)}
        aria-label={'Notifications' + (unreadCount > 0 ? ' (' + unreadCount + ' unread)' : '')}
        aria-expanded={open} aria-haspopup="menu">
        <BellIcon size={22} />
        {unreadCount > 0 && <span className="notification-bell-badge" aria-hidden="true">{badgeText}</span>}
      </button>
      {open && (
        <div className="notification-bell-dropdown" role="menu">
          <div className="notification-bell-dropdown-header">
            <h3 className="notification-bell-dropdown-title">Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="notification-bell-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notification-bell-dropdown-body">
            {loading && recent.length === 0 ? (
              <div className="notification-bell-loading">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="notification-bell-empty">No notifications yet</div>
            ) : (
              recent.map(n => (
                <NotificationItem key={n.id} notification={n} compact onMarkRead={markRead} onClick={() => setOpen(false)} />
              ))
            )}
          </div>
          <div className="notification-bell-dropdown-footer">
            <Link to="/notifications" className="notification-bell-see-all" onClick={() => setOpen(false)}>See all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}
