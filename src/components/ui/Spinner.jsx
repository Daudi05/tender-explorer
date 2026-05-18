/*
  Spinner.jsx — animated loading indicator.
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
