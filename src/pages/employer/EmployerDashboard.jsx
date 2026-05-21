import "../stub.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { useAuth } from "../../context/AuthContext"

const STATUS_STYLES = {
  OPEN:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  AWARDED: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  CLOSED:  { bg: '#f5f5f4', color: '#57534e', border: '#d6d3d1' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.CLOSED
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 9999,
      padding: "3px 12px",
      fontSize: "0.75rem",
      fontWeight: 700
    }}>
      {status}
    </span>
  )
}

export default function EmployerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [bidCounts, setBidCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [tenderData, bidData] = await Promise.all([
          apiFetch("/tenders/me"),
          apiFetch("/bids/employer/all"),
        ])

        const tenderList = tenderData.tenders || []
        setTenders(tenderList)

        const bids = bidData.bids || []
        const counts = {}
        bids.forEach((b) => {
          counts[b.tender_id] = (counts[b.tender_id] || 0) + 1
        })
        setBidCounts(counts)

      } catch {
        setError("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const open = tenders.filter((t) => t.status === "OPEN").length
  const awarded = tenders.filter((t) => t.status === "AWARDED").length

  if (loading) return <div className="stub-page"><p>Loading dashboard…</p></div>
  if (error) return <div className="stub-page"><p style={{ color: "var(--color-danger)" }}>{error}</p></div>

  return (
    <div className="dashboard-page">

      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "1rem",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-hover)",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        ← Back
      </button>

      <div className="employer-navbar">
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>
          Employer Panel
        </span>

        <div className="nav-links">
          <button onClick={() => navigate("/employer/create-tender")}>
            + Create Tender
          </button>
          <button onClick={() => navigate("/employer/my-tenders")}>
            My Tenders
          </button>
          <button onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </div>

      <div className="dashboard-header">
        <h1>Welcome, {user?.name || "Employer"}</h1>
        <p>Here's an overview of your tender activity</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Tenders</h3>
          <h1>{tenders.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Open</h3>
          <h1>{open}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Awarded</h3>
          <h1>{awarded}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Total Bids Received</h3>
          <h1>{Object.values(bidCounts).reduce((a, b) => a + b, 0)}</h1>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Tenders</h2>

        {tenders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              No tenders yet.
            </p>

            <button
              onClick={() => navigate("/employer/create-tender")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Create your first tender
            </button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Bids</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tenders.map((t) => {
                const count = bidCounts[t.id] || 0
                const canAward = t.status === "OPEN" && count > 0
                const canSendLetter = t.status === "AWARDED"

                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{t.category}</td>
                    <td style={{ fontWeight: 600 }}>
                      KES {Number(t.budget).toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color:
                          count >= 10
                            ? "var(--color-danger)"
                            : count > 0
                              ? "var(--color-primary)"
                              : "var(--color-text-muted)"
                      }}>
                        {count} / 10
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        
                        <button
                          onClick={() => navigate(`/employer/tenders/${t.id}/bids`)}
                        >
                          View Bids
                        </button>

                        <button
                          onClick={() =>
                            canAward && navigate(`/employer/award/${t.id}`)
                          }
                          disabled={!canAward}
                        >
                          {count === 0 ? "No bids yet" : "Award Now →"}
                        </button>

                        {/* ✅ ADDED: Send Award Letter */}
                        {canSendLetter && (
                          <button
                            onClick={() =>
                              navigate(`/employer/tenders/${t.id}/send-award-letter`)
                            }
                            style={{
                              padding: "5px 12px",
                              borderRadius: "8px",
                              border: "1px solid #10b981",
                              background: "#ecfdf5",
                              color: "#065f46",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontSize: "0.8rem"
                            }}
                          >
                            Send Award Letter 📩
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>

          </table>
        )}
      </div>
    </div>
  )
}