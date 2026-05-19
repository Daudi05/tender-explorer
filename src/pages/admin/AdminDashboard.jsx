import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import "../stub.css"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [flaggedBids, setFlaggedBids] = useState([])
  const [pendingDocs, setPendingDocs] = useState(0)
  const [activeTenders, setActiveTenders] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiFetch("/bids/flagged"),
      apiFetch("/documents/all"),
      apiFetch("/tenders"),
    ]).then(([bidsRes, docsRes, tendersRes]) => {
      if (bidsRes.status === "fulfilled") {
        const d = bidsRes.value
        setFlaggedBids(Array.isArray(d) ? d : d.bids ?? [])
      }
      if (docsRes.status === "fulfilled") {
        const docs = Array.isArray(docsRes.value) ? docsRes.value : docsRes.value.documents ?? []
        setPendingDocs(docs.filter((d) => d.verification_status === "pending").length)
      }
      if (tendersRes.status === "fulfilled") {
        const tenders = Array.isArray(tendersRes.value) ? tendersRes.value : tendersRes.value.tenders ?? []
        setActiveTenders(tenders.filter((t) => t.status === "OPEN").length)
      }
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { title: "Flagged Bids", value: loading ? "…" : flaggedBids.length },
    { title: "Pending Documents", value: loading ? "…" : pendingDocs },
    { title: "Active Tenders", value: loading ? "…" : activeTenders },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor fraud alerts, documents, and platform activity.</p>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <h3>{stat.title}</h3>
            <h1>{stat.value}</h1>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ margin: 0, border: 0, padding: 0 }}>
            Flagged Bids {!loading && `(${flaggedBids.length})`}
          </h2>
          <button
            onClick={() => navigate("/admin/flagged-bids")}
            style={{ padding: "0.45rem 1rem", background: "var(--color-primary-subtle)", color: "var(--color-primary)", border: "1px solid var(--color-primary-light)", borderRadius: 9999, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Loading…</p>
        ) : flaggedBids.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No flagged bids at the moment.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Bid ID</th>
                <th>Amount</th>
                <th>Fraud Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {flaggedBids.slice(0, 10).map((bid) => (
                <tr key={bid.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {bid.id?.slice(0, 8)}…
                  </td>
                  <td style={{ fontWeight: 600 }}>KES {Number(bid.bid_amount).toLocaleString()}</td>
                  <td style={{ color: "#dc2626", fontWeight: 700 }}>
                    {bid.fraud_score != null ? `${Number(bid.fraud_score).toFixed(1)}%` : "—"}
                  </td>
                  <td>
                    <span style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 9999, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                      ⚠ Flagged
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
