import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import './Notifications.css';

const PAGE_SIZE = 20;
const FILTERS = [
  { id: 'all',     label: 'All',     match: () => true },
  { id: 'unread',  label: 'Unread',  match: (n) => !n.is_read },
  { id: 'bids',    label: 'Bids',    match: (n) => n.type === 'BID' },
  { id: 'tenders', label: 'Tenders', match: (n) => n.type === 'TENDER' },
  { id: 'awards',  label: 'Awards',  match: (n) => n.type === 'AWARD' },
  { id: 'general', label: 'General', match: (n) => n.type === 'GENERAL' },
];

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const { notifications, loading, error, unreadCount, fetchAll, markRead, markAllRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { if (isAuthenticated) fetchAll(); }, [isAuthenticated, fetchAll]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeFilter]);

  const filtered = useMemo(() => {
    const filter = FILTERS.find(f => f.id === activeFilter) || FILTERS[0];
    return notifications.filter(filter.match);
  }, [notifications, activeFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  if (!isAuthenticated) {
    return (
      <div className="notifications-page">
        <div className="notifications-empty"><p>Please log in to see your notifications.</p></div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" className="notifications-mark-all" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>
      <div className="notifications-filters" role="tablist">
        {FILTERS.map(filter => {
          const count = notifications.filter(filter.match).length;
          const isActive = activeFilter === filter.id;
          return (
            <button key={filter.id} type="button" role="tab" aria-selected={isActive}
              className={'notifications-filter' + (isActive ? ' notifications-filter-active' : '')}
              onClick={() => setActiveFilter(filter.id)}>
              {filter.label}
              {count > 0 && <span className="notifications-filter-count">{count}</span>}
            </button>
          );
        })}
      </div>
      <div className="notifications-body">
        {error ? (
          <div className="notifications-error">
            <p>Failed to load notifications.</p>
            <button type="button" className="notifications-retry" onClick={fetchAll}>Try again</button>
          </div>
        ) : loading && notifications.length === 0 ? (
          <div>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="notifications-skeleton-row">
                <div className="notifications-skeleton-icon" />
                <div className="notifications-skeleton-content">
                  <div className="notifications-skeleton-line" />
                  <div className="notifications-skeleton-line notifications-skeleton-line-short" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="notifications-empty">
            <p>No notifications yet — we'll let you know when something happens.</p>
          </div>
        ) : (
          <>
            {visible.map(n => (
              <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
            ))}
            {hasMore && (
              <button type="button" className="notifications-load-more" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>Load more</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
