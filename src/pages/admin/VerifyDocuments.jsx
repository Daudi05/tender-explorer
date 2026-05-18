/*
  VerifyDocuments.jsx — admin page for reviewing and verifying uploaded documents.

  What this page does:
    - Shows all documents across all contractors (not just the logged-in user)
    - Admin can verify or reject each document
    - Admin can download documents to review before deciding
    - Filter tabs default to "pending" so admin sees what needs action first

  Why default to the "pending" tab:
  An admin visiting this page has one job: review unreviewed documents. Showing
  everything by default would bury the pending ones. Defaulting to "pending"
  means zero extra clicks to get to the work queue.

  Why we optimistically update the status before the server confirms:
  The verify/reject action is simple — it either works or it doesn't. Waiting
  for the server before updating the UI makes the page feel sluggish. If the
  server call fails, we revert the change and show an error toast. This gives
  snappy UX while still being correct.

  Why we keep verified/rejected documents viewable (not hide them after action):
  Audit trail. If a contractor disputes a rejection, the admin needs to see
  what they reviewed. Hiding docs after action would make it hard to review
  past decisions.
*/
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { downloadFile } from '../../utils/fileHelpers'
import DocumentRow from '../../components/DocumentRow'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/useToast'
import './VerifyDocuments.css'

const FILTER_TABS = ['pending', 'verified', 'rejected', 'all']

export default function VerifyDocuments() {
  const { toast } = useToast()

  // All documents across all users — fetched once on mount
  const [documents, setDocuments]       = useState([])
  const [loading, setLoading]           = useState(true)

  // Default to "pending" so admin immediately sees documents awaiting action
  const [activeFilter, setActiveFilter] = useState('pending')

  // Track which document is being downloaded (for per-row loading state)
  const [downloading, setDownloading]   = useState(null)

  useEffect(() => {
    fetchAllDocuments()
  }, [])

  async function fetchAllDocuments() {
    setLoading(true)
    try {
      // Admin endpoint returns all documents, not just the logged-in user's
      const data = await apiFetch('/documents/me') // backend returns all for admin role
      setDocuments(Array.isArray(data) ? data : data.documents ?? [])
    } catch (err) {
      toast('Failed to load documents', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Optimistically update a document's status in local state before server confirms.
  // If server call fails, we revert to the previous status and show an error.
  async function handleVerify(id, newStatus) {
    // Save the current status in case we need to revert
    const previous = documents.find((d) => d.id === id)?.verification_status

    // Optimistic update — update the UI immediately
    setDocuments((prev) =>
      prev.map((d) => d.id === id ? { ...d, verification_status: newStatus } : d)
    )

    try {
      await apiFetch(`/documents/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ verification_status: newStatus }),
      })
      toast(`Document ${newStatus}`, 'success')
    } catch (err) {
      // Revert the optimistic update on failure
      setDocuments((prev) =>
        prev.map((d) => d.id === id ? { ...d, verification_status: previous } : d)
      )
      toast(err.message || `Failed to ${newStatus} document`, 'error')
    }
  }

  // Download with auth header — same pattern as MyDocuments
  async function handleDownload(doc) {
    setDownloading(doc.id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/documents/${doc.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      downloadFile(blob, doc.original_filename)
    } catch (err) {
      toast('Download failed', 'error')
    } finally {
      setDownloading(null)
    }
  }

  const filteredDocs = activeFilter === 'all'
    ? documents
    : documents.filter((d) => d.verification_status === activeFilter)

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all'
      ? documents.length
      : documents.filter((d) => d.verification_status === tab).length
    return acc
  }, {})

  return (
    <div className="verify-docs-page">
      <div className="verify-docs-header">
        <div>
          <h1 className="verify-docs-title">Document Verification Queue</h1>
          <p className="verify-docs-subtitle">Review, verify, or reject contractor documents</p>
        </div>
      </div>

      {/* Filter tabs — pending is the default work view */}
      <div className="verify-docs-tabs" role="tablist">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeFilter === tab}
            className={`verify-docs-tab ${activeFilter === tab ? 'verify-docs-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="verify-docs-tab-count">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="verify-docs-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="verify-docs-skeleton-row">
              <Skeleton width="55%" height="16px" />
              <Skeleton width="35%" height="12px" />
            </div>
          ))
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
            title={activeFilter === 'pending' ? 'All caught up' : `No ${activeFilter} documents`}
            message={activeFilter === 'pending' ? 'No pending verifications — great work!' : `There are no documents with "${activeFilter}" status`}
          />
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="verify-docs-row-wrapper">
              <DocumentRow
                document={doc}
                showUploader={true}  // Admin needs to know who uploaded what
                onVerify={handleVerify}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
              >
                {downloading === doc.id ? '…' : '↓ Review'}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
