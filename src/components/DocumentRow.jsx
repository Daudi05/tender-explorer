/*
  DocumentRow.jsx — reusable row for displaying a single document.

  Used in two places with different configurations:
    - MyDocuments.jsx (contractor view): showUploader=false, onDelete provided
    - VerifyDocuments.jsx (admin view):  showUploader=true,  onVerify provided

  Why onDelete and onVerify are optional props (not always required):
  The same component needs to work in both contexts. An admin doesn't need a
  delete button; a contractor doesn't need verify/reject buttons. Optional props
  let the parent control exactly which actions appear.

  Why showUploader is opt-in (default false):
  Showing a contractor's name to other contractors would be a privacy problem.
  Admin sees names because they need to know who uploaded what for verification.
  Default-false means we never accidentally expose names.

  Props:
    document    {Document}          — the Document object from the backend
    showUploader {boolean}          — show the uploader's name (admin view only)
    onDelete    {function(id)|null}  — callback to delete this document
    onVerify    {function(id, status)|null} — callback to verify/reject (admin only)
    verifyingIds {Set}              — IDs of documents with a PATCH in flight; buttons are disabled
*/
import VerificationBadge from './VerificationBadge'
import Button from './ui/Button'
import { formatFileSize } from '../utils/fileHelpers'
import './DocumentRow.css'

// File type icon — inline SVG so no icon library needed
function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

// Human-readable labels for the document_type enum values from the backend
const TYPE_LABELS = {
  CV:           'CV / Resume',
  PROPOSAL:     'Bid Proposal',
  TENDER_DOC:   'Tender Document',
  AWARD_LETTER: 'Award Letter',
}

export default function DocumentRow({ document, showUploader = false, onDelete, onVerify, verifyingIds = new Set() }) {
  const { id, original_filename, file_size, document_type, verification_status, created_at, uploader_name } = document

  // Format the upload date — just the date, no time (the exact time is rarely useful)
  const uploadDate = new Date(created_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="doc-row">
      {/* Left: file icon + filename + metadata */}
      <div className="doc-row-info">
        <span className="doc-row-icon"><FileIcon /></span>
        <div className="doc-row-details">
          <span className="doc-row-name" title={original_filename}>{original_filename}</span>
          <div className="doc-row-meta">
            <span>{TYPE_LABELS[document_type] ?? document_type}</span>
            <span className="doc-row-dot">·</span>
            <span>{formatFileSize(file_size)}</span>
            <span className="doc-row-dot">·</span>
            <span>{uploadDate}</span>
            {/* Only shown in admin view — see showUploader comment at top */}
            {showUploader && uploader_name && (
              <>
                <span className="doc-row-dot">·</span>
                <span className="doc-row-uploader">{uploader_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: status badge + action buttons */}
      <div className="doc-row-actions">
        <VerificationBadge status={verification_status} />

        {/* Admin verify/reject buttons — only rendered if onVerify is provided */}
        {onVerify && (
          <>
            <Button
              variant="success"
              size="sm"
              onClick={() => onVerify(id, 'verified')}
              // Disabled if already verified OR if a PATCH is currently in flight for this row
              disabled={verification_status === 'verified' || verifyingIds.has(id)}
            >
              {verifyingIds.has(id) ? '…' : '✓ Verify'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onVerify(id, 'rejected')}
              disabled={verification_status === 'rejected' || verifyingIds.has(id)}
            >
              {verifyingIds.has(id) ? '…' : '✕ Reject'}
            </Button>
          </>
        )}

        {/* Delete button — only rendered if onDelete is provided */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
