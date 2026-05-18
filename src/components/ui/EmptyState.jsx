/*
  EmptyState.jsx
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Prop API must match Abubakar's component exactly.
  Props: icon (SVG element), title, message, action (optional JSX button/link)
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
