/*
  Skeleton.jsx
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Prop API must match Abubakar's component exactly.
  Props: width, height, borderRadius — all CSS strings.
*/
import './Skeleton.css'

export default function Skeleton({ width = '100%', height = '20px', borderRadius }) {
  return (
    <span
      className="ui-skeleton"
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}
