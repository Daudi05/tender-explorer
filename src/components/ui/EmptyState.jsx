import './EmptyState.css'

export const EmptyState = ({
  title = 'No data available',
  description = 'There are no records to display at this moment.',
  message,
  actionButton,
  action,
  icon,
  className = '',
}) => (
  <div className={`ui-empty-state ${className}`}>
    {icon && <div className="ui-empty-state-icon">{icon}</div>}
    <h3 className="ui-empty-state-title">{title}</h3>
    <p className="ui-empty-state-message">{message || description}</p>
    {(actionButton || action) && (
      <div className="ui-empty-state-action">{actionButton || action}</div>
    )}
  </div>
)

export default EmptyState
