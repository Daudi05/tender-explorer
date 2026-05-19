/*
  DocumentUploader.jsx — drag-and-drop file uploader for tender documents.

  This is a REUSABLE component. It is used in three places:
    1. MyDocuments.jsx  — contractor uploads their own CV, proposals, etc.
    2. AwardTender.jsx  — employer uploads the award letter before confirming award.
    (future) Any other place a file needs to attach to a bid or tender.

  How it works end-to-end:
    User drops file → client validates (type + size) → shows preview →
    user picks document type (if not pre-set) → clicks Upload →
    POST /api/documents/upload (multipart) → backend returns Document object →
    onUploadSuccess(document) callback fires → parent updates its list.

  Props:
    onUploadSuccess {function(document)} — called with the new Document after upload succeeds
    documentType    {string}             — if provided, hides the type selector (e.g. "AWARD_LETTER")
    bidId           {string|null}        — attaches document to a specific bid
    tenderId        {string|null}        — attaches document to a specific tender
*/
import { useState, useRef } from 'react'
import { apiFetch } from '../api/client'
import { validateFileSize, validateFileType, formatFileSize } from '../utils/fileHelpers'
import { useToast } from './ui/useToast'
import Button from './ui/Button'
import Spinner from './ui/Spinner'
import './DocumentUploader.css'

// The document types the backend accepts for the document_type field.
// We show these in a dropdown if the parent didn't pre-set the type.
const DOCUMENT_TYPES = [
  { value: 'CV',           label: 'CV / Resume' },
  { value: 'PROPOSAL',     label: 'Bid Proposal' },
  { value: 'TENDER_DOC',   label: 'Tender Document' },
  { value: 'AWARD_LETTER', label: 'Award Letter' },
]

export default function DocumentUploader({ onUploadSuccess, documentType, bidId, tenderId }) {
  const { toast } = useToast()

  // The file the user has selected — null until they pick or drop one.
  // We store it in state (not just a ref) so the preview re-renders when it changes.
  const [file, setFile]               = useState(null)

  // Validation error message to show under the drop zone.
  // Separate from the upload error so the user knows if it's a local or server problem.
  const [validationError, setValidationError] = useState('')

  // The selected document type when the parent didn't pre-set one.
  // Initialized to the first option so the dropdown starts with a valid value.
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].value)

  // Whether an upload is in progress. Used to:
  //   - Show spinner inside the button
  //   - Disable the button (prevent double-submit)
  //   - Disable the drop zone (don't let user change file mid-upload)
  const [uploading, setUploading] = useState(false)

  // Whether the user is dragging a file over the drop zone.
  // Used purely for the visual "active drag" highlight — no functional effect.
  const [dragActive, setDragActive] = useState(false)

  // Hidden file input — we trigger it programmatically on drop-zone click.
  // We can't style <input type="file"> well, so we hide it and use a custom zone.
  const fileInputRef = useRef(null)

  // --- File selection helpers ---

  function handleFileSelect(selectedFile) {
    // Clear previous validation errors before checking the new file
    setValidationError('')

    try {
      // Run client-side checks before showing preview.
      // Why validate here before upload? Instant feedback — user knows immediately
      // if they grabbed the wrong file, without waiting for a server round-trip.
      validateFileType(selectedFile)
      validateFileSize(selectedFile)
      setFile(selectedFile)
    } catch (err) {
      // Show the error in the UI and don't set the file
      setValidationError(err.message)
      setFile(null)
    }
  }

  // --- Drag-and-drop event handlers ---

  function handleDragOver(e) {
    e.preventDefault() // Required to allow dropping — browser default is to reject drops
    setDragActive(true)
  }

  function handleDragLeave() {
    setDragActive(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    // DataTransfer.files is a FileList — grab the first file only
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  // --- Click-to-browse handler ---

  function handleZoneClick() {
    // Don't open file picker if upload is in progress
    if (!uploading) fileInputRef.current?.click()
  }

  function handleInputChange(e) {
    const picked = e.target.files[0]
    if (picked) handleFileSelect(picked)
    // Reset the input value so the same file can be re-selected after removing
    e.target.value = ''
  }

  // --- Upload ---

  async function handleUpload() {
    if (!file) return

    // Determine the document type to send:
    // - If the parent passed documentType as a prop, use that (e.g. "AWARD_LETTER")
    // - Otherwise use whatever the user picked in the dropdown
    const typeToSend = documentType || selectedType

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)                        // The actual file blob
      formData.append('document_type', typeToSend)         // Required field on backend
      if (bidId)    formData.append('bid_id', bidId)       // Optional — links doc to a bid
      if (tenderId) formData.append('tender_id', tenderId) // Optional — links doc to a tender

      // Note: NO Content-Type header here. apiFetch auto-detects FormData and lets
      // the browser set the multipart/form-data boundary header automatically.
      // Setting Content-Type manually would break the boundary and the server
      // would fail to parse the uploaded file.
      const newDocument = await apiFetch('/documents/upload', {
        method: 'POST',
        body: formData,
      })

      toast('Document uploaded successfully', 'success')

      // Reset the uploader so it's ready for another file
      setFile(null)
      setValidationError('')

      // Notify the parent so it can add the new document to its list
      onUploadSuccess(newDocument)
    } catch (err) {
      toast(err.message || 'Upload failed. Please try again.', 'error')
    } finally {
      // Always re-enable the button whether upload succeeded or failed
      setUploading(false)
    }
  }

  // --- The actual type to show in the UI ---
  // If documentType is pre-set by parent, we don't show the selector and
  // display a read-only label instead.
  const resolvedType = documentType
    ? DOCUMENT_TYPES.find(t => t.value === documentType)?.label ?? documentType
    : null

  return (
    <div className="doc-uploader">
      {/* Drop zone — doubles as click-to-browse */}
      <div
        className={`doc-uploader-zone ${dragActive ? 'doc-uploader-zone--active' : ''} ${uploading ? 'doc-uploader-zone--disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        aria-label="Drop file here or click to browse"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick() }}
      >
        {/* Upload icon */}
        <svg className="doc-uploader-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>

        {file ? (
          // File preview — show name and size so user can confirm they picked the right file
          // before committing to the upload
          <div className="doc-uploader-preview">
            <span className="doc-uploader-filename">{file.name}</span>
            <span className="doc-uploader-filesize">{formatFileSize(file.size)}</span>
          </div>
        ) : (
          <div className="doc-uploader-hint">
            <span className="doc-uploader-hint-main">Drag & drop or click to browse</span>
            <span className="doc-uploader-hint-sub">PDF, DOC, DOCX, JPG, PNG · max 10 MB</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Validation error — shown immediately, not after upload attempt */}
      {validationError && (
        <p className="doc-uploader-error" role="alert">{validationError}</p>
      )}

      {/* Document type selector — hidden when parent pre-sets the type */}
      {!documentType ? (
        <div className="doc-uploader-type-row">
          <label className="doc-uploader-label" htmlFor="doc-type-select">Document type</label>
          <select
            id="doc-type-select"
            className="doc-uploader-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={uploading}
          >
            {DOCUMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      ) : (
        // Read-only label when type is pre-determined (e.g. Award Letter flow)
        <div className="doc-uploader-type-row">
          <span className="doc-uploader-label">Document type</span>
          <span className="doc-uploader-type-fixed">{resolvedType}</span>
        </div>
      )}

      {/* Upload button */}
      <Button
        variant="primary"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? (
          // Inline spinner replaces the label while uploading so the button
          // stays the same size and the user knows something is happening
          <><Spinner size="sm" color="#fff" /> Uploading…</>
        ) : 'Upload'}
      </Button>
    </div>
  )
}
