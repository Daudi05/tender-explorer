/*
  AwardTender.jsx — employer awards a tender to a winning contractor.

  This is the most complex page in the module. The full flow is:
    1. Load the tender + all its bids in parallel (faster than sequential)
    2. Employer reviews the bid table and selects a winner via radio button
    3. Employer uploads an award letter (required before confirming)
    4. Employer clicks "Confirm Award" — PATCH tender to AWARDED status
    5. Redirect to /employer/my-tenders

  Why an award letter is required before confirming:
  Legal and anti-fraud requirement. The letter creates a paper trail that proves
  the employer officially notified the winner. Without it, the award could be
  disputed. Backend enforces this too, but we block the button client-side for
  immediate feedback.

  Why we disable "Confirm Award" until BOTH bid selected AND letter uploaded:
  Preventing a half-finished award. An award with no winner or no letter is
  incomplete and could cause confusion downstream (e.g. notifications going
  to no one, or award record with no document attached).

  Why we use Promise.all for tender + bids fetches:
  The two fetches are independent — tender data doesn't depend on bids and
  vice versa. Running them in parallel cuts the wait time roughly in half.
  Sequential fetches would be simpler to read but needlessly slower.

  Why we redirect after success (not just show a success message):
  After awarding, there's nothing left to do on this page. The tender is now
  closed. Redirecting to MyTenders shows the updated status immediately and
  prevents the employer from accidentally clicking "Confirm Award" twice.
*/
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import DocumentUploader from '../../components/DocumentUploader'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/useToast'
import './AwardTender.css'

// Fallback FraudBadge if Allan hasn't pushed his component yet.
// Once Allan pushes, replace this with: import FraudBadge from '../../components/FraudBadge'
function FraudBadge({ bid }) {
  if (!bid?.is_flagged) return null
  return <span className="award-fraud-flag" title={`Fraud score: ${bid.fraud_score}`}>⚠ Flagged</span>
}

export default function AwardTender() {
  const { id: tenderId } = useParams() // tender ID from URL: /employer/award/:id
  const navigate = useNavigate()
  const { toast } = useToast()

  // Tender data and bids — loaded in parallel on mount
  const [tender, setTender]     = useState(null)
  const [bids, setBids]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // The bid the employer selected as the winner — null until they pick one
  const [selectedBidId, setSelectedBidId] = useState(null)

  // Tracks whether the award letter has been uploaded.
  // We need this to enable the "Confirm Award" button.
  // We store the document ID (not just a boolean) in case we need it later.
  const [awardLetterId, setAwardLetterId] = useState(null)

  // Whether the final PATCH /tenders/:id call is in progress
  const [awarding, setAwarding] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [tenderId])

  async function loadPageData() {
    setLoading(true)
    setError(null)
    try {
      // Run both fetches in parallel — see "Why Promise.all" comment at top of file
      const [tenderData, bidsData] = await Promise.all([
        apiFetch(`/tenders/${tenderId}`),
        apiFetch(`/bids/tender/${tenderId}`),
      ])
      setTender(tenderData.tender || tenderData)
      // Backend returns { bids: [...] } or just [...]
      setBids(Array.isArray(bidsData) ? bidsData : bidsData.bids ?? [])
    } catch (err) {
      setError('Failed to load tender data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  // Called by DocumentUploader after the award letter is successfully uploaded.
  // We store the document ID and update the button enabled state.
  function handleLetterUploaded(document) {
    setAwardLetterId(document.id)
    toast('Award letter uploaded', 'success')
  }

  async function handleConfirmAward() {
    if (!selectedBidId || !awardLetterId) return // button should be disabled but double-check

    setAwarding(true)
    try {
      // PATCH the tender to mark it as AWARDED with the winning bid
      await apiFetch(`/tenders/${tenderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          winning_bid_id: selectedBidId,
          status: 'AWARDED',
        }),
      })
      toast('Tender awarded successfully!', 'success')
      // Redirect to tender list — see "Why we redirect" comment at top
      navigate('/employer/my-tenders')
    } catch (err) {
      toast(err.message || 'Failed to award tender. Please try again.', 'error')
      setAwarding(false)
    }
  }

  // Format currency as KES with comma separators
  function formatKES(amount) {
    return `KES ${Number(amount).toLocaleString('en-KE')}`
  }

  // --- Render states ---

  if (loading) {
    return (
      <div className="award-page">
        <div className="award-skeleton">
          <Skeleton width="40%" height="28px" />
          <Skeleton width="60%" height="16px" />
          <Skeleton width="100%" height="200px" borderRadius="8px" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="award-page">
        <div className="award-error">
          <p>{error}</p>
          <Button variant="ghost" onClick={loadPageData}>Retry</Button>
        </div>
      </div>
    )
  }

  // Guard: if tender is already awarded, don't let employer award again
  if (tender?.status === 'AWARDED') {
    return (
      <div className="award-page">
        <div className="award-already-awarded">
          <h2>Tender already awarded</h2>
          <p>This tender has already been awarded to a contractor.</p>
          <Button variant="ghost" onClick={() => navigate('/employer/my-tenders')}>
            Back to My Tenders
          </Button>
        </div>
      </div>
    )
  }

  const selectedBid = bids.find((b) => b.id === selectedBidId)

  return (
    <div className="award-page">
      {/* Tender summary header */}
      <div className="award-header">
        <div>
          <h1 className="award-title">Award Tender</h1>
          <h2 className="award-tender-name">{tender.title}</h2>
          <div className="award-tender-meta">
            <span>Budget: <strong>{formatKES(tender.budget)}</strong></span>
            <span className="award-dot">·</span>
            <span>Deadline: <strong>{new Date(tender.deadline).toLocaleDateString('en-KE')}</strong></span>
            <span className="award-dot">·</span>
            <span><strong>{bids.length}</strong> bid{bids.length !== 1 ? 's' : ''} received</span>
          </div>
        </div>
      </div>

      {/* Step 1 — Select winning bid */}
      <section className="award-section">
        <h3 className="award-section-title">
          <span className="award-step">1</span>
          Select the winning bid
        </h3>

        {bids.length === 0 ? (
          <p className="award-no-bids">No bids have been submitted for this tender yet.</p>
        ) : (
          <div className="award-bids-table-wrapper">
            <table className="award-bids-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Contractor</th>
                  <th>Bid Amount</th>
                  <th>Timeline</th>
                  <th>Flags</th>
                  <th>Proposal Preview</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr
                    key={bid.id}
                    className={`award-bid-row ${selectedBidId === bid.id ? 'award-bid-row--selected' : ''} ${bid.is_flagged ? 'award-bid-row--flagged' : ''}`}
                    onClick={() => setSelectedBidId(bid.id)}
                  >
                    <td>
                      <input
                        type="radio"
                        name="winning-bid"
                        checked={selectedBidId === bid.id}
                        onChange={() => setSelectedBidId(bid.id)}
                        aria-label={`Select bid from ${bid.contractor_name}`}
                      />
                    </td>
                    <td className="award-bid-contractor">{bid.contractor_name ?? `Contractor #${bid.contractor_id}`}</td>
                    <td className="award-bid-amount">{formatKES(bid.bid_amount)}</td>
                    <td>{bid.completion_months} mo.</td>
                    <td>
                      {/* FraudBadge from Allan — falls back gracefully if not built yet */}
                      <FraudBadge bid={bid} />
                    </td>
                    <td className="award-bid-proposal">
                      {/* Truncate proposal to 100 chars — full text visible on Allan's TenderBids page */}
                      {bid.proposal_summary
                        ? bid.proposal_summary.length > 100
                          ? bid.proposal_summary.slice(0, 100) + '…'
                          : bid.proposal_summary
                        : <span className="award-bid-no-proposal">No proposal</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Step 2 — Upload award letter */}
      <section className="award-section">
        <h3 className="award-section-title">
          <span className="award-step">2</span>
          Upload award letter
          {awardLetterId && <span className="award-step-done">✓ Uploaded</span>}
        </h3>
        <p className="award-section-desc">
          An official award letter is required before confirming. This creates a legal record
          of the award and will be visible to the winning contractor under My Awards.
        </p>

        {/* Hide the uploader once a letter is uploaded — one letter per tender */}
        {!awardLetterId ? (
          <DocumentUploader
            documentType="AWARD_LETTER"
            tenderId={tenderId}
            onUploadSuccess={handleLetterUploaded}
          />
        ) : (
          <div className="award-letter-uploaded">
            <span>✓ Award letter uploaded</span>
            <button className="award-letter-replace" onClick={() => setAwardLetterId(null)}>
              Replace
            </button>
          </div>
        )}
      </section>

      {/* Step 3 — Confirm */}
      <section className="award-section award-confirm-section">
        {/* Show what will be awarded before the employer commits */}
        {selectedBid && (
          <div className="award-summary">
            Awarding to: <strong>{selectedBid.contractor_name ?? `Contractor #${selectedBid.contractor_id}`}</strong>
            {' '}for <strong>{formatKES(selectedBid.bid_amount)}</strong>
          </div>
        )}

        <Button
          variant="success"
          size="lg"
          // Both conditions must be true — see "Why we disable" comment at top
          disabled={!selectedBidId || !awardLetterId || awarding}
          onClick={handleConfirmAward}
        >
          {awarding ? 'Confirming…' : 'Confirm Award'}
        </Button>

        {/* Tell the employer exactly what's still needed */}
        {(!selectedBidId || !awardLetterId) && (
          <p className="award-requirements">
            {!selectedBidId && !awardLetterId
              ? 'Select a bid and upload the award letter to continue'
              : !selectedBidId
              ? 'Select a winning bid to continue'
              : 'Upload the award letter to continue'}
          </p>
        )}
      </section>
    </div>
  )
}
