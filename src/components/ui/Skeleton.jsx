/*
  Skeleton.jsx — shimmer placeholder for loading states.
  Props: width, height, borderRadius — all CSS strings.
  Using skeletons instead of a spinner on list pages makes the layout feel
  stable while data loads (no layout shift once content arrives).
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
