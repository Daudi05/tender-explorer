import { useEffect, useState } from "react"
import { getMyBids } from "../../services/bidService"
import "../stub.css"

const STATUS_STYLES = {
  PENDING:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  AWARDED:  { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  REJECTED: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  OPEN:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 9999, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 700,
    }}>
      {status}
    </span>
  )
}

export default function MyBids() {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyBids()
      .then((data) => setBids(Array.isArray(data) ? data : data.bids ?? []))
      .catch((err) => setError(err.message || "Failed to load bids"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="stub-page"><p>Loading your bids…</p></div>
  if (error) return <div className="stub-page"><p style={{ color: "#ef4444" }}>{error}</p></div>

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="dashboard-header">
        <h1>My Bids</h1>
        <p>{bids.length} bid{bids.length !== 1 ? "s" : ""} submitted</p>
      </div>

      {bids.length === 0 ? (
        <div className="stub-page">
          <h2>No bids yet</h2>
          <p>Browse open tenders and submit your first bid.</p>
        </div>
      ) : (
        <div className="dashboard-section">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Tender</th>
                <th>Bid Amount</th>
                <th>Timeline</th>
                <th>Score</th>
                <th>Status</th>
                <th>Fraud</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "0.85rem" }}>
                    {bid.tender_id?.slice(0, 8) || "—"}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    KES {Number(bid.bid_amount).toLocaleString("en-KE")}
                  </td>
                  <td>{bid.completion_months ? `${bid.completion_months} mo` : "—"}</td>
                  <td>
                    {bid.evaluation_score != null
                      ? <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{Number(bid.evaluation_score).toFixed(1)}</span>
                      : <span style={{ color: "#9ca3af" }}>pending</span>
                    }
                  </td>
                  <td><StatusBadge status={bid.status} /></td>
                  <td>
                    {bid.is_flagged ? (
                      <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.8rem" }}>⚠ Flagged</span>
                    ) : (
                      <span style={{ color: "#10b981", fontWeight: 600, fontSize: "0.8rem" }}>✓ OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
