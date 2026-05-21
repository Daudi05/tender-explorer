import "../stub.css"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "../../api/client"

export default function SendAwardLetter() {
  const { tenderId } = useParams()
  const navigate = useNavigate()

  const [tender, setTender] = useState(null)
  const [winner, setWinner] = useState(null)
  const [file, setFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const tenderData = await apiFetch(`/tenders/${tenderId}`)
        setTender(tenderData.tender || tenderData)

        const bidsData = await apiFetch(`/bids/tender/${tenderId}`)

        const bids = Array.isArray(bidsData)
          ? bidsData
          : bidsData.bids || []

        const winningBid = bids.find((b) => b.is_winner)

        setWinner(winningBid)
      } catch (err) {
        setError(err.message || "Failed to load tender data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenderId])

  async function handleSubmit(e) {
  e.preventDefault()

  if (!file) {
    setError("Please select a PDF file")
    return
  }

  if (!winner) {
    setError("No winning bid available for this tender")
    return
  }

  setUploading(true)
  setError(null)
  setSuccess(null)

  try {
    const formData = new FormData()
    formData.append("file", file)

    // IMPORTANT: use apiFetch or correct base URL instead of hardcoding localhost
    const response = await fetch(`/api/award-letters/upload/${tenderId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: formData,
})

    let data
    try {
      data = await response.json()
    } catch {
      throw new Error("Server returned invalid response")
    }

    if (!response.ok) {
      throw new Error(data.error || `Upload failed (${response.status})`)
    }

    setSuccess("Award letter uploaded successfully")

    setTimeout(() => {
      navigate("/employer/my-tenders")
    }, 1500)

  } catch (err) {
    setError(err.message || "Failed to upload award letter")
  } finally {
    setUploading(false)
  }
}

  if (loading) {
    return (
      <div className="stub-page">
        <p>Loading award details...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "1rem",
          padding: "0.6rem 1rem",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          background: "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      <div className="dashboard-header">
        <h1>Send Award Letter</h1>
        <p>Upload the official award letter for the winning contractor</p>
      </div>

      <div className="dashboard-section">

        <h2 style={{ marginBottom: "1rem" }}>
          {tender?.title}
        </h2>

        {winner ? (
          <div
            style={{
              marginBottom: "2rem",
              padding: "1rem",
              borderRadius: "12px",
              background: "var(--color-surface-hover)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p>
              <strong>Winning Bid Amount:</strong>{" "}
              KES {Number(winner.bid_amount).toLocaleString()}
            </p>

            <p>
              <strong>Evaluation Score:</strong>{" "}
              {winner.evaluation_score}
            </p>

            <p>
              <strong>Winning Contractor:</strong>{" "}
              {winner.contractor_name || "Contractor"}
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              marginBottom: "1.5rem",
            }}
          >
            No winning bid found for this tender.
          </div>
        )}

        {error && (
          <div className="toast toast-error" style={{ marginBottom: "1rem" }}>
            ✕ {error}
          </div>
        )}

        {success && (
          <div className="toast toast-success" style={{ marginBottom: "1rem" }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              Upload Award Letter (PDF)
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                width: "100%",
                maxWidth: "500px",
                background: "white",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !winner}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              background: uploading || !winner
                ? "#9ca3af"
                : "var(--color-primary)",
              color: "white",
              fontWeight: 700,
              cursor: uploading || !winner
                ? "not-allowed"
                : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Send Award Letter"}
          </button>
        </form>

      </div>
    </div>
  )
}