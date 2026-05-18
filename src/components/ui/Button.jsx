/*
  Button.jsx
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Prop API must match Abubakar's component exactly.
  Props: variant ("primary"|"danger"|"success"|"ghost"), size ("sm"|"md"|"lg"), disabled, onClick, children, type
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
