import "../stub.css"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { formatKES } from "../../utils/formatters"

export default function TenderDetail() {
  const { id } = useParams()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    bid_amount: "",
    proposal_summary: "",
    completion_months: "",
  })

  useEffect(() => { fetchTender() }, [])

  async function fetchTender() {
    setLoading(true)
    try {
      const data = await apiFetch(`/tenders/${id}`)
      setTender(data.tender)
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to load tender" })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (message?.type === "error") setMessage(null)
  }

  async function submitBid(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      await apiFetch("/bids", {
        method: "POST",
        body: JSON.stringify({
          tender_id: id,
          bid_amount: Number(form.bid_amount),
          proposal_summary: form.proposal_summary?.trim(),
          completion_months: Number(form.completion_months),
        }),
      })
      setMessage({ type: "success", text: "Bid submitted successfully! You will be notified of the outcome." })
      setForm({ bid_amount: "", proposal_summary: "", completion_months: "" })
    } catch (err) {
      const detail = err?.details ? JSON.stringify(err.details) : (err?.message || "Bid submission failed")
      setMessage({ type: "error", text: detail })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !tender) {
    return <div className="stub-page"><p>Loading tender…</p></div>
  }

  const deadline = new Date(tender.deadline).toLocaleDateString("en-KE", {
    year: "numeric", month: "long", day: "numeric"
  })

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Tender info card */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        borderRadius: 20,
        padding: "2rem",
        marginBottom: "1.5rem",
        color: "white",
      }}>
        <span style={{
          display: "inline-block",
          background: "rgba(167,139,250,0.2)",
          border: "1px solid rgba(167,139,250,0.4)",
          color: "#c4b5fd",
          fontSize: "0.75rem",
          fontWeight: 700,
          padding: "3px 12px",
          borderRadius: 9999,
          marginBottom: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>{tender.category}</span>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          {tender.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          {tender.description}
        </p>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#a78bfa" }}>{formatKES(tender.budget)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deadline</div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>{deadline}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: tender.status === "OPEN" ? "#6ee7b7" : "#fca5a5" }}>{tender.status}</div>
          </div>
        </div>
      </div>

      {/* Bid form */}
      <div className="dashboard-section">
        <h2>Submit your bid</h2>

        {message && (
          <div className={`toast toast-${message.type}`}>
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        <form onSubmit={submitBid} className="bid-form" style={{ maxWidth: "100%" }}>
          <label>Bid amount (KES)</label>
          <input
            type="number"
            name="bid_amount"
            placeholder="e.g. 500000"
            value={form.bid_amount}
            onChange={handleChange}
            required
          />

          <label>Proposal summary</label>
          <textarea
            name="proposal_summary"
            placeholder="Describe your approach, experience, and why you're the best fit…"
            value={form.proposal_summary}
            onChange={handleChange}
          />

          <label>Estimated completion (months)</label>
          <input
            type="number"
            name="completion_months"
            placeholder="e.g. 6"
            value={form.completion_months}
            onChange={handleChange}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Bid →"}
          </button>
        </form>
      </div>
    </div>
  )
}
