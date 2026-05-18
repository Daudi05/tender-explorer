/*
  Badge.jsx
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Prop API must match Abubakar's component exactly.
  Props: variant ("success"|"warning"|"danger"|"info"|"default"), children
*/
import './Badge.css'

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`ui-badge ui-badge--${variant}`}>
      {children}
    </span>
  )
}
