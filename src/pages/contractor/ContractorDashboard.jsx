import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { useAuth } from "../../context/AuthContext"
import TenderCard from "../../components/TenderCard"
import "../stub.css"

export default function ContractorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiFetch("/tenders"),
      apiFetch("/bids/me"),
    ]).then(([tendersRes, bidsRes]) => {
      if (tendersRes.status === "fulfilled") {
        const d = tendersRes.value
        setTenders(Array.isArray(d) ? d : d.tenders ?? [])
      }
      if (bidsRes.status === "fulfilled") {
        const d = bidsRes.value
        setMyBids(Array.isArray(d) ? d : d.bids ?? [])
      }
    }).finally(() => setLoading(false))
  }, [])

  const openTenders = tenders.filter((t) => t.status === "OPEN")
  const awardedBids = myBids.filter((b) => b.is_winner)
  const pendingBids = myBids.filter((b) => b.status === "PENDING" || b.status === "OPEN")

  if (loading) return <div className="stub-page"><p>Loading dashboard…</p></div>

  return (
    <div className="dashboard-page">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "1rem",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          border: "1px solid var(--color-border)",
          background: "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      {/* Inner nav */}
      <div className="employer-navbar">
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>Contractor Panel</span>
        <div className="nav-links">
          <button onClick={() => navigate("/contractor/browse")}>Browse Tenders</button>
          <button onClick={() => navigate("/contractor/my-bids")}>My Bids</button>
          <button onClick={() => navigate("/contractor/my-awards")}>My Awards</button>
          <button onClick={() => navigate("/contractor/my-documents")}>Documents</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/contractor/award-letters")}>Award Letters</button>
        </div>
      </div>

      <div className="dashboard-header">
        <h1>Welcome, {user?.name || "Contractor"}</h1>
        <p>Find tenders, submit bids, and track your awards</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Open Tenders</h3>
          <h1>{openTenders.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>My Bids</h3>
          <h1>{myBids.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Pending Bids</h3>
          <h1>{pendingBids.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Awards Won</h3>
          <h1>{awardedBids.length}</h1>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ margin: 0, border: 0, padding: 0 }}>Open Tenders</h2>
          <button
            onClick={() => navigate("/contractor/browse")}
            style={{ padding: "0.45rem 1rem", background: "var(--color-primary-subtle)", color: "var(--color-primary)", border: "1px solid var(--color-primary-light)", borderRadius: 9999, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
          >
            View all →
          </button>
        </div>

        {openTenders.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No open tenders at the moment.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {openTenders.slice(0, 6).map((tender) => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}