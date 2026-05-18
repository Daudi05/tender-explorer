/*
  MyAwards.jsx — contractor's view of all tenders they have won.

  What this page does:
    1. Fetches the contractor's own bids (GET /api/bids/me)
    2. Filters client-side for bids where is_winner === true
    3. For each winning bid, fetches the tender details in parallel
    4. Renders "trophy cards" showing tender info + download link for award letter

  Why we filter on the client side instead of a dedicated /bids/me?is_winner=true endpoint:
  We already fetch all bids for MyBids (Allan's page). Adding a server-side filter
  would be a new endpoint just to save filtering ~50 items in JS — not worth the
  added backend surface. If a contractor wins dozens of tenders, revisit this.

  Why we fetch tender details in parallel (Promise.all):
  Each winning bid needs its tender's title, employer, and budget. Running those
  fetches sequentially would be N×API-latency. Promise.all runs them concurrently
  so the page loads as fast as the slowest single fetch, not the sum of all.

  Why the "trophy card" has a gradient border:
  Visual celebration — an awarded tender is a career milestone for a contractor.
  The gold→green gradient draws the eye and feels distinct from the neutral list
  cards on other pages. It's a deliberate departure from the standard card style.
*/
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { downloadFile } from '../../utils/fileHelpers'
// Note: no raw fetch() or localStorage access — apiFetch handles auth for blobs too.
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/useToast'
import './MyAwards.css'

export default function MyAwards() {
  const { toast } = useToast()

  // Each entry is { bid, tender } — combined after parallel fetches
  const [awards, setAwards]         = useState([])
  const [loading, setLoading]       = useState(true)

  // Tracks a fetch error — prevents showing "No awards yet" when the fetch actually broke
  const [fetchError, setFetchError] = useState(null)

  // Track which award's letter is being downloaded
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    loadAwards()
  }, [])

  async function loadAwards() {
    setLoading(true)
    setFetchError(null)
    try {
      const bidsData = await apiFetch('/bids/me')
      const allBids = Array.isArray(bidsData) ? bidsData : bidsData.bids ?? []
      const winningBids = allBids.filter((b) => b.is_winner === true)

      if (winningBids.length === 0) {
        setAwards([])
        setLoading(false)
        return
      }

      // Use Promise.allSettled instead of Promise.all so one failed tender fetch
      // doesn't wipe out all successfully loaded awards.
      // fulfilled entries get displayed; rejected ones are silently skipped.
      const results = await Promise.allSettled(
        winningBids.map((bid) => apiFetch(`/tenders/${bid.tender_id}`))
      )

      const combined = winningBids
        .map((bid, i) => ({ bid, result: results[i] }))
        .filter(({ result }) => result.status === 'fulfilled')
        .map(({ bid, result }) => ({ bid, tender: result.value }))

      setAwards(combined)
    } catch (err) {
      setFetchError(err.message || 'Failed to load awards')
    } finally {
      setLoading(false)
    }
  }

  // Download the award letter for a specific tender.
  // We look for a document of type AWARD_LETTER attached to this tender.
  async function handleDownloadLetter(tender) {
    setDownloading(tender.id)
    try {
      // Fetch documents attached to this tender and find the AWARD_LETTER
      const docsData = await apiFetch(`/documents/me?tender_id=${tender.id}`)
      const docs = Array.isArray(docsData) ? docsData : docsData.documents ?? []
      const letter = docs.find((d) => d.document_type === 'AWARD_LETTER')

      if (!letter) {
        toast('Award letter not found for this tender', 'error')
        return
      }

      // Use apiFetch with responseType:'blob' — handles auth token and 401 automatically
      const blob = await apiFetch(`/documents/${letter.id}/download`, {
        responseType: 'blob',
      })
      downloadFile(blob, letter.original_filename)
    } catch (err) {
      toast('Failed to download award letter', 'error')
    } finally {
      setDownloading(null)
    }
  }

  function formatKES(amount) {
    return `KES ${Number(amount).toLocaleString('en-KE')}`
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="my-awards-page">
        <h1 className="my-awards-title">My Awards</h1>
        <div className="my-awards-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="my-awards-skeleton-card">
              <Skeleton width="70%" height="20px" />
              <Skeleton width="50%" height="14px" />
              <Skeleton width="40%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state — not an empty state, the fetch actually failed
  if (fetchError) {
    return (
      <div className="my-awards-page">
        <h1 className="my-awards-title">My Awards</h1>
        <div className="my-awards-error" role="alert">
          <p>{fetchError}</p>
          <button className="my-awards-retry" onClick={loadAwards}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="my-awards-page">
      <div className="my-awards-header">
        <h1 className="my-awards-title">My Awards</h1>
        <p className="my-awards-subtitle">
          {awards.length > 0
            ? `You have won ${awards.length} tender${awards.length !== 1 ? 's' : ''}`
            : 'Tenders you win will appear here'}
        </p>
      </div>

      {awards.length === 0 ? (
        <EmptyState
          icon={
            // Trophy icon
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M19 3H5v2c0 3.87 2.69 7.12 6.36 7.83L12 13l.64-.17C16.31 12.12 19 8.87 19 5V3z"/>
              <path d="M12 14c-.55 0-1 .45-1 1v2H9v2h6v-2h-2v-2c0-.55-.45-1-1-1z"/>
            </svg>
          }
          title="No awards yet"
          message="Keep bidding! When an employer selects you as the winner, your award will appear here."
        />
      ) : (
        <div className="my-awards-grid">
          {awards.map(({ bid, tender }) => (
            <div key={bid.id} className="award-card">
              {/* Gold trophy badge */}
              <div className="award-card-trophy" aria-label="Award winner">🏆</div>

              <div className="award-card-body">
                <h2 className="award-card-tender-name">{tender.title}</h2>

                <div className="award-card-meta">
                  <div className="award-card-row">
                    <span className="award-card-label">Your bid</span>
                    <span className="award-card-value award-card-amount">
                      {formatKES(bid.bid_amount)}
                    </span>
                  </div>
                  <div className="award-card-row">
                    <span className="award-card-label">Timeline</span>
                    <span className="award-card-value">{bid.completion_months} months</span>
                  </div>
                  {tender.awarded_at && (
                    <div className="award-card-row">
                      <span className="award-card-label">Awarded on</span>
                      <span className="award-card-value">{formatDate(tender.awarded_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="award-card-footer">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadLetter(tender)}
                  disabled={downloading === tender.id}
                >
                  {downloading === tender.id ? 'Downloading…' : '↓ Award Letter'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
