/*
  Badge.jsx — minimal stub matching Abubakar's prop API.
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
