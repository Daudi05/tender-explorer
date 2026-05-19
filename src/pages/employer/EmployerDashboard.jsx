import "../stub.css"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { useAuth } from "../../context/AuthContext"

export default function EmployerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true)

        const data = await apiFetch("/api/tenders/me")

        setTenders(data?.tenders || [])
      } catch (err) {
        console.log("Error loading tenders:", err)
        setError("Failed to load tenders")
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div className="dashboard-container">

      {/* ================= EMPLOYER NAVBAR (NEW ADDITION) ================= */}
      <div className="employer-navbar">

        <h2 className="logo">Employer Panel</h2>

        <div className="nav-links">

          <button onClick={() => navigate("/employer/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/employer/create-tender")}>
            + Create Tender
          </button>

          <button onClick={() => navigate("/employer/my-tenders")}>
            My Tenders
          </button>

        </div>
      </div>

      {/* ================= HEADER ================= */}
      <h1>Employer Dashboard</h1>

      <p className="welcome-text">
        Welcome, {user?.name || "Employer"}
      </p>

      {/* ================= TENDERS ================= */}
      <div className="tender-grid">

        {tenders.length === 0 ? (
          <p>No tenders created yet.</p>
        ) : (
          tenders.map((tender) => (
            <div key={tender.id} className="tender-card">

              <h3>{tender.title || "Untitled Tender"}</h3>

              <p><strong>Category:</strong> {tender.category || "N/A"}</p>
              <p><strong>Budget:</strong> ${tender.budget || 0}</p>
              <p><strong>Status:</strong> {tender.status || "UNKNOWN"}</p>

              {/* WINNER SECTION */}
              {tender.status === "AWARDED" && tender.winning_bid && (
                <div className="winner-box">
                  <h4>🏆 Winner</h4>

                  <p>
                    <strong>Bid Amount:</strong>{" "}
                    ${tender.winning_bid.bid_amount || 0}
                  </p>

                  <p>
                    <strong>Score:</strong>{" "}
                    {tender.winning_bid.evaluation_score || 0}
                  </p>

                  <p>
                    <strong>Contractor:</strong>{" "}
                    {tender.winning_bid.contractor?.name || "N/A"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {tender.winning_bid.contractor?.email || "N/A"}
                  </p>
                </div>
              )}

              {/* ACTIONS */}
              <div className="actions">
                <button
                  onClick={() =>
                    navigate(`/employer/tenders/${tender.id}/bids`)
                  }
                >
                  View Bids
                </button>

                {tender.status === "OPEN" && (
                  <button
                    onClick={() =>
                      navigate(`/employer/award/${tender.id}`)
                    }
                  >
                    Award Tender
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}