import './Button.css'

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  disabled = false,
  icon,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--${size} ui-btn--${variant} ${className}`}
      disabled={isDisabled || disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

export default Button
