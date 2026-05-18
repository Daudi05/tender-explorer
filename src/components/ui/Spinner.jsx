/*
  Spinner.jsx
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Prop API must match Abubakar's component exactly.
  Props: size ("sm"|"md"|"lg"), color (CSS color string, defaults to primary)
*/
import './Spinner.css'

export default function Spinner({ size = 'md', color }) {
  return (
    <span
      className={`ui-spinner ui-spinner--${size}`}
      style={color ? { borderTopColor: color } : undefined}
      aria-label="Loading"
    />
  )
}
