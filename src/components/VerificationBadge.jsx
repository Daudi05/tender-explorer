/*
  VerificationBadge.jsx — displays the verification status of a document.

  Why we use Abubakar's Badge component instead of styling our own:
  Badge already handles colors, padding, and border-radius in a consistent way.
  If the design system changes, only Badge.css needs to update — not every
  component that shows a status pill.

  Business context for each status:
  - "pending"  → document uploaded but admin hasn't reviewed it yet. Normal state for new docs.
  - "verified" → admin confirmed the document is legitimate. Required before bidding on some tenders.
  - "rejected" → admin flagged the document as invalid (wrong type, tampered, unreadable).

  Props:
    status {string} — "pending" | "verified" | "rejected"
*/
import Badge from './ui/Badge'
import './VerificationBadge.css'

export default function VerificationBadge({ status }) {
  // Map each backend status value to the correct Badge variant and label
  const config = {
    pending:  { variant: 'warning', label: 'Pending',  icon: '●' },
    verified: { variant: 'success', label: 'Verified', icon: '✓' },
    rejected: { variant: 'danger',  label: 'Rejected', icon: '✕' },
  }

  // Fallback to "pending" if status is undefined or unexpected value
  const { variant, label, icon } = config[status] ?? config.pending

  return (
    <Badge variant={variant}>
      <span className="verification-badge-icon" aria-hidden="true">{icon}</span>
      {label}
    </Badge>
  )
}
