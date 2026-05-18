/*
  MyDocuments.jsx — contractor's document management page.

  What this page does:
    - Shows all documents the logged-in contractor has uploaded
    - Lets them upload new documents via a Modal with DocumentUploader
    - Lets them download any document (fetches as authenticated blob)
    - Lets them delete documents (with a confirmation step)
    - Filters documents by verification status via tabs

  Why we filter on the client side (not with a server query param):
  A typical contractor has ~10–50 documents. Filtering 50 items in memory is
  instant and saves a round-trip. If this grows to thousands, we'd move it
  server-side, but that complexity isn't justified now.

  Why we refetch after delete (not optimistic removal):
  Optimistic removal is faster but can leave the UI in a wrong state if the
  DELETE request fails (e.g. server error or race condition). Refetching is
  one extra request but always shows accurate data. Correctness > micro-speed.

  Why we use a Modal for the uploader instead of navigating to a new page:
  Staying on the list page after upload means the user immediately sees their
  new document appear in the list. Navigation would lose that context.
*/
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { downloadFile } from '../../utils/fileHelpers'
import DocumentRow from '../../components/DocumentRow'
import DocumentUploader from '../../components/DocumentUploader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/useToast'
import './MyDocuments.css'

// Filter tab options — matches the verification_status values from the backend
const FILTER_TABS = ['all', 'pending', 'verified', 'rejected']

export default function MyDocuments() {
  const { toast } = useToast()

  // Full list of documents from the server — never filtered directly.
  // We derive the filtered view from this so switching tabs doesn't re-fetch.
  const [documents, setDocuments]     = useState([])

  // Whether the initial fetch is in progress — shows skeleton rows
  const [loading, setLoading]         = useState(true)

  // Active filter tab — "all" shows everything
  const [activeFilter, setActiveFilter] = useState('all')

  // Upload modal open/close state
  const [uploadOpen, setUploadOpen]   = useState(false)

  // ID of the document the user wants to delete — null means no dialog shown
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  // Whether a download is in progress for a specific document ID.
  // We track per-ID so we can show a spinner on the right row.
  const [downloading, setDownloading] = useState(null)

  // Fetch all documents when the page mounts
  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const data = await apiFetch('/documents/me')
      // Backend returns { documents: [...] } or just [...] — handle both
      setDocuments(Array.isArray(data) ? data : data.documents ?? [])
    } catch (err) {
      toast('Failed to load documents', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Called by DocumentUploader after a successful upload.
  // We add the new document to the front of the list without re-fetching —
  // we already have the full Document object from the upload response.
  function handleUploadSuccess(newDoc) {
    setDocuments((prev) => [newDoc, ...prev])
    setUploadOpen(false)
    toast('Document uploaded', 'success')
  }

  // Download a document as an authenticated blob.
  // We can't use a plain <a href> because the endpoint requires Authorization header.
  async function handleDownload(doc) {
    setDownloading(doc.id)
    try {
      // We need the raw Response (not parsed JSON) for binary file download,
      // so we bypass apiFetch and use fetch directly with the auth header
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/documents/${doc.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      downloadFile(blob, doc.original_filename)
    } catch (err) {
      toast('Download failed. Please try again.', 'error')
    } finally {
      setDownloading(null)
    }
  }

  // Show the confirmation dialog — actual deletion happens in handleConfirmDelete
  function handleDeleteClick(id) {
    setDeleteTargetId(id)
  }

  async function handleConfirmDelete() {
    const id = deleteTargetId
    setDeleteTargetId(null) // close dialog immediately so it feels responsive

    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' })
      toast('Document deleted', 'success')
      // Refetch after delete to ensure accuracy — see comment at top of file
      await fetchDocuments()
    } catch (err) {
      toast(err.message || 'Failed to delete document', 'error')
    }
  }

  // Derive the visible list from the active filter — no extra state needed
  const filteredDocs = activeFilter === 'all'
    ? documents
    : documents.filter((d) => d.verification_status === activeFilter)

  // Counts per tab for the badge numbers
  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all'
      ? documents.length
      : documents.filter((d) => d.verification_status === tab).length
    return acc
  }, {})

  return (
    <div className="my-docs-page">
      {/* Page header */}
      <div className="my-docs-header">
        <div>
          <h1 className="my-docs-title">My Documents</h1>
          <p className="my-docs-subtitle">Upload and manage your CVs, proposals, and certificates</p>
        </div>
        <Button variant="primary" onClick={() => setUploadOpen(true)}>
          + Upload New
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="my-docs-tabs" role="tablist">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeFilter === tab}
            className={`my-docs-tab ${activeFilter === tab ? 'my-docs-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="my-docs-tab-count">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="my-docs-list">
        {loading ? (
          // Skeleton rows — 5 placeholders while data loads
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="my-docs-skeleton-row">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="30%" height="12px" />
            </div>
          ))
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            }
            title={activeFilter === 'all' ? 'No documents yet' : `No ${activeFilter} documents`}
            message={activeFilter === 'all' ? 'Upload your CV, certificate, or proposal to get started' : `You have no documents with "${activeFilter}" status`}
            action={
              activeFilter === 'all' && (
                <Button variant="primary" onClick={() => setUploadOpen(true)}>Upload your first document</Button>
              )
            }
          />
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="my-docs-row-wrapper">
              <DocumentRow
                document={doc}
                showUploader={false}
                onDelete={handleDeleteClick}
              />
              {/* Download button — separate from DocumentRow so it can have its own loading state */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
              >
                {downloading === doc.id ? '…' : '↓ Download'}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Upload modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        <DocumentUploader onUploadSuccess={handleUploadSuccess} />
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        message="Are you sure you want to delete this document? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
