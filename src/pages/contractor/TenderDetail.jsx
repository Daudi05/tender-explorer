import "../stub.css"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { formatKES } from "../../utils/formatters"
import { useNavigate } from "react-router-dom"
export default function TenderDetail() {
  const { id } = useParams()

  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [blockReason, setBlockReason] = useState(null) // 'unverified' | 'no-docs' | null
  const [file, setFile] = useState(null)
  const [documentType, setDocumentType] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    bid_amount: "",
    proposal_summary: "",
    completion_months: "",
  })

  useEffect(() => { fetchTender() }, [])

  async function fetchTender() {
    try {
      setLoading(true)
      // apiFetch auto-prepends /api — use path without /api prefix
      const data = await apiFetch(`/tenders/${id}`)
      setTender(data.tender)
    } catch (error) {
      console.error(error)
      setMessage({ type: "error", text: "Failed to load tender" })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submitBid(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setBlockReason(null)

    try {
      const formData = new FormData()
      formData.append("tender_id", id)
      formData.append("bid_amount", form.bid_amount)
      formData.append("proposal_summary", form.proposal_summary)
      formData.append("completion_months", form.completion_months)

      if (file) {
        formData.append("file", file)
        formData.append("document_type", documentType || "BID_SUPPORT_DOCUMENT")
      }

      // apiFetch auto-prepends /api — use path without /api prefix
      await apiFetch("/bids", { method: "POST", body: formData })

      setMessage({ type: "success", text: "Bid submitted successfully! You will be notified of the outcome." })
      setForm({ bid_amount: "", proposal_summary: "", completion_months: "" })
      setFile(null)
      setDocumentType("")

    } catch (error) {
      console.error("Bid error:", error)

      // 403 means account not verified OR no verified documents
      if (error.status === 403) {
        const msg = (error.message || "").toLowerCase()
        if (msg.includes("not verified") || msg.includes("account")) {
          setBlockReason("unverified")
        } else {
          setBlockReason("no-docs")
        }
        return
      }

      const backendMessage = error?.message || "Bid submission failed"
      setMessage({
        type: "error",
        text: typeof backendMessage === "object" ? JSON.stringify(backendMessage) : backendMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="stub-page"><p>Loading tender…</p></div>
  }

  if (!tender) {
    return <div className="stub-page"><p>Tender not found</p></div>
  }

  const deadline = new Date(tender.deadline).toLocaleDateString("en-KE", {
    year: "numeric", month: "long", day: "numeric",
  })

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Tender info card */}
      <div style={{
        background: "var(--color-primary-active)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        marginBottom: "1.5rem",
        color: "white",
      }}>
        <span style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,255,255,0.9)",
          fontSize: "0.75rem",
          fontWeight: 700,
          padding: "3px 12px",
          borderRadius: 9999,
          marginBottom: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>{tender.category}</span>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          {tender.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          {tender.description}
        </p>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{formatKES(tender.budget)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deadline</div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>{deadline}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: tender.status === "OPEN" ? "#86efac" : "#fca5a5" }}>
              {tender.status}
            </div>
          </div>
        </div>
      </div>

      {/* Bid form */}
      <div className="dashboard-section">
        <h2>Submit Your Bid</h2>

        {/* Verification blocking banners */}
        {blockReason === "unverified" && (
          <div className="verify-alert">
            <p>Your account isn't verified yet. Admin needs to verify you before you can bid.</p>
            <Link to="/profile">Verify Account →</Link>
          </div>
        )}

        {blockReason === "no-docs" && (
          <div className="verify-alert">
            <p>You need at least one admin-verified document before you can submit a bid.</p>
            <Link to="/contractor/my-documents">Upload Document →</Link>
          </div>
        )}

        {/* Success / error message */}
        {message && (
          <div className={`toast toast-${message.type}`}>
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        {/* Only show the form if not blocked */}
        {!blockReason && tender.status === "OPEN" && (
          <form onSubmit={submitBid} className="bid-form">
            <label>Bid Amount (KES)</label>
            <input
              type="number"
              name="bid_amount"
              placeholder="e.g. 500000"
              value={form.bid_amount}
              onChange={handleChange}
              required
            />

            <label>Proposal Summary</label>
            <textarea
              name="proposal_summary"
              placeholder="Describe your approach, experience, and why you're the best fit…"
              value={form.proposal_summary}
              onChange={handleChange}
              required
            />

            <label>Estimated Completion (months)</label>
            <input
              type="number"
              name="completion_months"
              placeholder="e.g. 6"
              value={form.completion_months}
              onChange={handleChange}
              required
            />

            <label>Supporting Document (optional)</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              <option value="">Select document type</option>
              <option value="BUSINESS_PERMIT">Business Permit</option>
              <option value="TAX_COMPLIANCE">Tax Compliance</option>
              <option value="NCA_CERTIFICATE">NCA Certificate</option>
              <option value="PORTFOLIO">Portfolio</option>
            </select>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Bid →"}
            </button>
          </form>
        )}

        {tender.status !== "OPEN" && (
          <p style={{ color: "var(--color-text-muted)", padding: "1rem 0" }}>
            This tender is no longer accepting bids.
          </p>
        )}
      </div>
    </div>
  )
}
