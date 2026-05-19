/*
  AwardBadge.jsx — shows a "Awarded" trophy badge on a winning bid.

  Why we check bid.is_winner (not bid.status === "AWARDED"):
  The backend sets is_winner=true specifically on the one bid the employer
  selected. bid.status can be "accepted" for other reasons. is_winner is
  the authoritative field for awarding.

  Why we return null instead of an empty <span>:
  Returning null means this component leaves no DOM node when there's no award.
  An empty span would still take up space and could break flex/grid layouts in
  parent components. Null is the React-idiomatic way to render nothing.

  Props:
    bid {object} — the Bid object from the backend. Only needs bid.is_winner.
*/
import Badge from './ui/Badge'
import './AwardBadge.css'

// Trophy SVG — inline so we don't need an icon library dependency
function TrophyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5v2c0 3.87 2.69 7.12 6.36 7.83L12 13l.64-.17C16.31 12.12 19 8.87 19 5V3z"/>
      <path d="M12 14c-.55 0-1 .45-1 1v2H9v2h6v-2h-2v-2c0-.55-.45-1-1-1z"/>
      <path d="M5 5H3c0 2.55 1.64 4.72 4 5.46V5z"/>
      <path d="M19 5h-2v5.46c2.36-.74 4-2.91 4-5.46z"/>
    </svg>
  )
}

export default function AwardBadge({ bid }) {
  // Only render if this bid actually won — see comment at top of file
  if (!bid?.is_winner) return null

  return (
    <Badge variant="success">
      <TrophyIcon />
      Awarded
    </Badge>
  )
}
