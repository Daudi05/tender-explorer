import "../stub.css"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"

const STATUS_STYLES = {
  AWARDED:  { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  REJECTED: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  PENDING:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  OPEN:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 9999, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 700 }}>
      {status}
    </span>
  )
}

export default function TenderBids() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tender, setTender] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch(`/tenders/${id}`),
      apiFetch(`/bids/tender/${id}`),
    ])
      .then(([tenderData, bidsData]) => {
        setTender(tenderData.tender || tenderData)
        setBids(Array.isArray(bidsData) ? bidsData : bidsData.bids ?? [])
      })
      .catch((err) => setError(err.message || "Failed to load bids"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="stub-page"><p>Loading bids…</p></div>
  if (error) return <div className="stub-page"><p style={{ color: "#ef4444" }}>{error}</p></div>

  const winner = bids.find((b) => b.is_winner)
  const sorted = [...bids].sort((a, b) => (b.evaluation_score || 0) - (a.evaluation_score || 0))

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Tender header */}
      <div style={{ background: "var(--color-primary-active)", borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "1.5rem", color: "white" }}>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {tender?.category}
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>{tender?.title}</h1>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget</div>
            <div style={{ fontWeight: 700, color: "#86efac" }}>KES {Number(tender?.budget).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
            <div style={{ fontWeight: 700 }}>{tender?.status}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Bids</div>
            <div style={{ fontWeight: 700 }}>{bids.length}</div>
          </div>
        </div>
      </div>

      {/* Winner card */}
      {winner && (
        <div style={{ background: "linear-gradient(135deg,#059669,#10b981)", borderRadius: 14, padding: "1.25rem 1.75rem", marginBottom: "1.5rem", color: "white", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>🏆</span>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Winning Bid</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
              KES {Number(winner.bid_amount).toLocaleString()} · Score: {Number(winner.evaluation_score || 0).toFixed(1)}
            </div>
            <div style={{ opacity: 0.85, fontSize: "0.875rem" }}>
              Bid ID: {winner.id?.slice(0, 8)}…
            </div>
          </div>
        </div>
      )}

      {/* Bids table */}
      <div className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ margin: 0, padding: 0, border: 0 }}>All Bids ({bids.length})</h2>
          {tender?.status === "OPEN" && (
            <button
              onClick={() => navigate(`/employer/award/${id}`)}
              style={{ padding: "0.55rem 1.25rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
            >
              Award Tender →
            </button>
          )}
        </div>

        {bids.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No bids submitted yet.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bid Amount</th>
                <th>Timeline</th>
                <th>Score</th>
                <th>Fraud</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((bid, i) => (
                <tr key={bid.id}>
                  <td style={{ color: "#9ca3af", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 700 }}>KES {Number(bid.bid_amount).toLocaleString()}</td>
                  <td>{bid.completion_months ? `${bid.completion_months} mo` : "—"}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: bid.evaluation_score >= 70 ? "#059669" : bid.evaluation_score >= 40 ? "#d97706" : "#dc2626" }}>
                      {bid.evaluation_score != null ? Number(bid.evaluation_score).toFixed(1) : "—"}
                    </span>
                  </td>
                  <td>
                    {bid.is_flagged
                      ? <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.8rem" }}>⚠ Flagged</span>
                      : <span style={{ color: "#10b981", fontSize: "0.8rem" }}>✓ OK</span>
                    }
                  </td>
                  <td><StatusBadge status={bid.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
