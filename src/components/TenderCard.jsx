import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "./TenderCard.css"

const STATUS_COLORS = {
  OPEN:    { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  AWARDED: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  CLOSED:  { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
}

export default function TenderCard({ tender }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleClick() {
    if (!user) return navigate("/login")
    if (user.role === "CONTRACTOR") navigate(`/contractor/tenders/${tender.id}`)
    if (user.role === "EMPLOYER") navigate(`/employer/tenders/${tender.id}/bids`)
  }

  const status = tender.status || "OPEN"
  const badge = STATUS_COLORS[status] || STATUS_COLORS.OPEN
  const budget = Number(tender.budget).toLocaleString("en-KE")
  const deadline = tender.deadline
    ? new Date(tender.deadline).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
    : "N/A"

  return (
    <div className="tender-card" onClick={handleClick} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
          color: "var(--color-primary)", background: "var(--color-primary-subtle)", padding: "2px 10px",
          borderRadius: 9999, border: "1px solid var(--color-primary-light)",
        }}>
          {tender.category || "General"}
        </span>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700,
          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
          padding: "2px 10px", borderRadius: 9999,
        }}>
          {status}
        </span>
      </div>

      <h3>{tender.title}</h3>
      <p style={{
        marginBottom: "1rem", flexGrow: 1,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {tender.description}
      </p>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)",
      }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>KES {budget}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{deadline}</div>
        </div>
      </div>

      {user?.role === "CONTRACTOR" && status === "OPEN" && (
        <div style={{
          marginTop: "1rem", padding: "0.55rem",
          background: "var(--color-primary)",
          color: "white", borderRadius: 10, textAlign: "center",
          fontSize: "0.875rem", fontWeight: 600,
        }}>
          Place Bid →
        </div>
      )}
    </div>
  )
}
