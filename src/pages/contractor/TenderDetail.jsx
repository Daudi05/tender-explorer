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

  const [file, setFile] = useState(null)

  const [documentType, setDocumentType] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    bid_amount: "",
    proposal_summary: "",
    completion_months: "",
  })

  // ==================================================
  // FETCH TENDER
  // ==================================================
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

  // ==================================================
  // HANDLE INPUT CHANGES
  // ==================================================
  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // ==================================================
  // SUBMIT BID
  // ==================================================
  async function submitBid(e) {

    e.preventDefault()

    try {

      setSubmitting(true)

      setMessage(null)

      const formData = new FormData()

      // REQUIRED FIELDS
      formData.append("tender_id", id)

      formData.append(
        "bid_amount",
        form.bid_amount
      )

      formData.append(
        "proposal_summary",
        form.proposal_summary
      )

      formData.append(
        "completion_months",
        form.completion_months
      )

      // OPTIONAL DOCUMENT
      if (file) {

        formData.append("file", file)

        formData.append(
          "document_type",
          documentType || "BID_SUPPORT_DOCUMENT"
        )
      }

      // DEBUG
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await apiFetch("/api/bids", {
        method: "POST",
        body: formData,
      })

      console.log(response)

      setMessage({
        type: "success",
        text: "Bid submitted successfully",
      })

      // RESET FORM
      setForm({
        bid_amount: "",
        proposal_summary: "",
        completion_months: "",
      })

      setFile(null)

      setDocumentType("")

    } catch (error) {

      console.error("FULL ERROR:", error)

      const backendMessage =
        error?.details ||
        error?.error ||
        error?.message

      setMessage({
        type: "error",
        text:
          typeof backendMessage === "object"
            ? JSON.stringify(backendMessage)
            : backendMessage || "Bid failed",
      })

    } finally {

      setSubmitting(false)
    }
  }

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {

    return (
      <div className="dashboard-page">
        <p>Loading tender...</p>
      </div>
    )
  }

  // ==================================================
  // NO TENDER
  // ==================================================
  if (!tender) {

    return (
      <div className="dashboard-page">
        <p>Tender not found</p>
      </div>
    )
  }

  // ==================================================
  // UI
  // ==================================================
  return (

    <div className="dashboard-page">

      {/* ================================================== */}
      {/* TENDER DETAILS */}
      {/* ================================================== */}
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

      {/* ================================================== */}
      {/* BID FORM */}
      {/* ================================================== */}
      <div className="dashboard-section">

        <h2>Submit Bid</h2>

        {/* ================================================== */}
        {/* MESSAGE */}
        {/* ================================================== */}
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

        <form
          onSubmit={submitBid}
          className="bid-form"
        >

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

          {/* ================================================== */}
          {/* DOCUMENT TYPE */}
          {/* ================================================== */}
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">
              Select Document Type
            </option>

            <option value="BUSINESS_PERMIT">
              Business Permit
            </option>

            <option value="TAX_COMPLIANCE">
              Tax Compliance
            </option>

            <option value="NCA_CERTIFICATE">
              NCA Certificate
            </option>

            <option value="PORTFOLIO">
              Portfolio
            </option>
          </select>

          {/* ================================================== */}
          {/* FILE */}
          {/* ================================================== */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Bid"}
          </button>

        </form>

      </div>

    </div>
  )
}