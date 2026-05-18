/*
  Button.jsx — minimal stub until Abubakar ships the full UI library.
  Matches the prop API Abubakar documented so our imports won't need to change.
  Props: variant ("primary"|"danger"|"success"|"ghost"), size, disabled, onClick, children, type
*/
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
