import "../stub.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { useAuth } from "../../context/AuthContext"

const STATUS_STYLES = {
  OPEN:    { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  AWARDED: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  CLOSED:  { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.CLOSED
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 9999, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 700 }}>
      {status}
    </span>
  )
}

export default function EmployerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch("/tenders/me")
      .then((data) => setTenders(data.tenders || []))
      .catch(() => setError("Failed to load tenders"))
      .finally(() => setLoading(false))
  }, [])

  const open = tenders.filter((t) => t.status === "OPEN").length
  const awarded = tenders.filter((t) => t.status === "AWARDED").length

  if (loading) return <div className="stub-page"><p>Loading dashboard…</p></div>
  if (error) return <div className="stub-page"><p style={{ color: "#ef4444" }}>{error}</p></div>

  return (
    <div className="dashboard-page">
      {/* Inner nav */}
      <div className="employer-navbar">
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>Employer Panel</span>
        <div className="nav-links">
          <button onClick={() => navigate("/employer/create-tender")}>+ Create Tender</button>
          <button onClick={() => navigate("/employer/my-tenders")}>My Tenders</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
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
      </div>

      <div className="dashboard-section">
        <h2>My Tenders</h2>

        {tenders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>No tenders yet.</p>
            <button
              onClick={() => navigate("/employer/create-tender")}
              style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td style={{ color: "#6b7280" }}>{t.category}</td>
                  <td style={{ fontWeight: 600 }}>KES {Number(t.budget).toLocaleString()}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => navigate(`/employer/tenders/${t.id}/bids`)}
                        style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #c4b5fd", background: "#f5f3ff", color: "#7c3aed", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        View Bids
                      </button>
                      <button
                        onClick={() => navigate(`/employer/award/${t.id}`)}
                        style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        Award
                      </button>
                    </div>
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
