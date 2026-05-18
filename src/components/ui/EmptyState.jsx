/*
  EmptyState.jsx — shown when a list has no items.
  Props: icon (SVG element), title, message, action (optional JSX button/link)
  Consistent empty states prevent blank white voids that confuse users.
*/
import './EmptyState.css'

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="ui-empty-state">
      {icon && <div className="ui-empty-state-icon">{icon}</div>}
      <h3 className="ui-empty-state-title">{title}</h3>
      {message && <p className="ui-empty-state-message">{message}</p>}
      {action && <div className="ui-empty-state-action">{action}</div>}
    </div>
  )
}
