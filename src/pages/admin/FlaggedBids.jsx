import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import "../stub.css"

export default function FlaggedBids() {
  const navigate = useNavigate()

  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlaggedBids()
  }, [])

  async function fetchFlaggedBids() {
    try {
      setLoading(true)

      const data = await apiFetch("/api/bids/flagged")

      setBids(data.bids || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading flagged bids...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 14px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          background: "white",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "16px",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "#f3f4f6"
        }}
        onMouseOut={(e) => {
          e.target.style.background = "white"
        }}
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>🚨 Flagged Bids</h1>
        <p>Review suspicious or high-risk bids submitted on the platform</p>
      </div>

      {/* EMPTY STATE */}
      {bids.length === 0 ? (
        <div className="dashboard-section">
          <h3>No flagged bids 🎉</h3>
          <p>The system has not detected any suspicious activity.</p>
        </div>
      ) : (
        <div className="dashboard-section">

          {/* TABLE */}
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Contractor</th>
                <th>Tender</th>
                <th>Bid Amount</th>
                <th>Risk Score</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id}>

                  <td>
                    <strong>{bid.contractor_name}</strong>
                  </td>

                  <td>{bid.tender_title}</td>

                  <td>
                    KES {Number(bid.bid_amount).toLocaleString()}
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background:
                          bid.risk_score > 80
                            ? "#fee2e2"
                            : bid.risk_score > 50
                            ? "#fef3c7"
                            : "#dcfce7",
                        color:
                          bid.risk_score > 80
                            ? "#991b1b"
                            : bid.risk_score > 50
                            ? "#92400e"
                            : "#166534",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {bid.risk_score}%
                    </span>
                  </td>

                  <td>{bid.flag_reason || "—"}</td>

                  <td>
                    <button
                      style={{
                        padding: "6px 10px",
                        marginRight: "6px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#1d4ed8",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>

                    <button
                      style={{
                        padding: "6px 10px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#dc2626",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Investigate
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}