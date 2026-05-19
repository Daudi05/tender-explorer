import "../stub.css"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { apiFetch } from "../../api/client"
import { formatKES } from "../../utils/formatters"

export default function TenderDetail() {
  const { id } = useParams()

  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    bid_amount: "",
    proposal_summary: "",
    completion_months: "",
  })

  // ================= FETCH TENDER =================
  useEffect(() => {
    fetchTender()
  }, [])

  async function fetchTender() {
    try {
      setLoading(true)

      const data = await apiFetch(`/api/tenders/${id}`)

      setTender(data.tender)
    } catch (error) {
      console.error(error)

      setMessage({
        type: "error",
        text: "Failed to load tender",
      })
    } finally {
      setLoading(false)
    }
  }

  // ================= HANDLE INPUTS =================
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // ================= SUBMIT BID =================
  async function submitBid(e) {
    e.preventDefault()

    try {
      setMessage(null)

      const payload = {
        tender_id: id,
        bid_amount: Number(form.bid_amount),
        proposal_summary: form.proposal_summary.trim(),
        completion_months: Number(form.completion_months),
      }

      await apiFetch("/api/bids", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setMessage({
        type: "success",
        text: "Bid submitted successfully",
      })

      setForm({
        bid_amount: "",
        proposal_summary: "",
        completion_months: "",
      })

    } catch (error) {
      console.error(error)

      const backendMessage =
        error?.data?.details ||
        error?.data?.error ||
        error?.message

      setMessage({
        type: "error",
        text:
          typeof backendMessage === "object"
            ? JSON.stringify(backendMessage)
            : backendMessage || "Bid failed",
      })
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading...</p>
      </div>
    )
  }

  // ================= NO TENDER =================
  if (!tender) {
    return (
      <div className="dashboard-page">
        <p>Tender not found</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      {/* ================= TENDER DETAILS ================= */}
      <div className="dashboard-section">

        <h1>{tender.title}</h1>

        <p>{tender.description}</p>

        <h2>{formatKES(tender.budget)}</h2>

        <p>
          <strong>Category:</strong> {tender.category}
        </p>

        <p>
          <strong>Deadline:</strong> {tender.deadline}
        </p>

        <p>
          <strong>Status:</strong> {tender.status}
        </p>

      </div>

      {/* ================= BID FORM ================= */}
      <div className="dashboard-section">

        <h2>Submit Bid</h2>

        {/* ================= MESSAGE ================= */}
        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              fontWeight: "600",
              background:
                message.type === "success"
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                message.type === "success"
                  ? "#166534"
                  : "#991b1b",
              border:
                message.type === "success"
                  ? "1px solid #86efac"
                  : "1px solid #fca5a5",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={submitBid} className="bid-form">

          <input
            type="number"
            name="bid_amount"
            placeholder="Bid Amount (KES)"
            value={form.bid_amount}
            onChange={handleChange}
            required
          />

          <textarea
            name="proposal_summary"
            placeholder="Describe your proposal"
            value={form.proposal_summary}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="completion_months"
            placeholder="Estimated Completion (Months)"
            value={form.completion_months}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Submit Bid
          </button>

        </form>

      </div>

    </div>
  )
}