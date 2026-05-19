import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FileIcon, BriefcaseIcon, TrophyIcon, BellIcon, DotIcon, CheckIcon } from '../utils/icons';
import './NotificationItem.css';

const TYPE_CONFIG = {
  BID:     { Icon: FileIcon,      colorVar: 'var(--color-info)' },
  TENDER:  { Icon: BriefcaseIcon, colorVar: 'var(--color-primary)' },
  AWARD:   { Icon: TrophyIcon,    colorVar: 'var(--color-success)' },
  GENERAL: { Icon: BellIcon,      colorVar: 'var(--color-text-muted)' },
};

export default function NotificationItem({ notification, compact = false, onMarkRead, onClick }) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.GENERAL;
  const { Icon, colorVar } = config;
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (notification.type === 'AWARD' && !notification.is_read) setShouldAnimate(true);
  }, [notification.type, notification.is_read]);

  const handleClick = () => {
    if (!notification.is_read) onMarkRead?.(notification.id);
    if (notification.link) navigate(notification.link);
    onClick?.();
  };

  const handleMarkRead = (e) => {
    e.stopPropagation();
    onMarkRead?.(notification.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  };

  const itemClass = [
    'notification-item',
    !notification.is_read && 'notification-item-unread',
    compact && 'notification-item-compact',
    notification.type === 'AWARD' && 'notification-item-award',
    shouldAnimate && 'notification-item-animate',
  ].filter(Boolean).join(' ');

  const timeAgo = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : 'just now';

  const iconSize = notification.type === 'AWARD' ? 32 : 24;

  return (
    <div className={itemClass} role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
      <div className="notification-item-icon" style={{ color: colorVar }}>
        <Icon size={iconSize} />
      </div>
      <div className="notification-item-content">
        <div className="notification-item-message">{notification.message}</div>
        <div className="notification-item-time">{timeAgo}</div>
      </div>
      <div className="notification-item-actions">
        {!notification.is_read && (
          compact ? (
            <span className="notification-item-dot" aria-label="Unread">
              <DotIcon color="var(--color-primary)" />
            </span>
          ) : (
            <button type="button" className="notification-item-mark-read" onClick={handleMarkRead} aria-label="Mark as read">
              <CheckIcon size={16} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
