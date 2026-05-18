/*
  Modal.jsx — minimal stub matching Abubakar's prop API.
  Renders a centered overlay. Props: isOpen, onClose, title, children, size ("sm"|"md"|"lg")

  // TEMPORARY: Replaced when abubakar/ui-library merges.
  // Prop API must match Abubakar's component exactly.
*/
import { useEffect, useId } from 'react'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // useId gives a stable unique ID for aria-labelledby — required for screenreaders
  // to announce the modal title when it opens
  const titleId = useId()

  // Close on Escape key — user expects Esc to dismiss dialogs
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="ui-modal-overlay"
      onClick={onClose}
      // aria-hidden on the overlay so screenreaders focus on the dialog, not the backdrop
      aria-hidden="true"
    >
      <div
        className={`ui-modal ui-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // Remove aria-hidden so the dialog itself IS read by screenreaders
        aria-hidden="false"
      >
        <div className="ui-modal-header">
          <h2 id={titleId} className="ui-modal-title">{title}</h2>
          <button className="ui-modal-close" onClick={onClose} aria-label="Close dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  )
}
