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
  async function fetchEmployerTenders() {
    try {
      setLoading(true)

      const data = await apiFetch("/api/tenders/me")

      console.log("Employer tenders:", data)

      // ✅ FIX: extract array properly
      setTenders(data.tenders || [])
    } catch (err) {
      console.error("Dashboard Error:", err)
      setError("Failed to load employer tenders")
    } finally {
      setLoading(false)
    }
  }

  fetchEmployerTenders()
}, [])
  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">

      {/* ================= NAVBAR ================= */}
      <div className="employer-navbar">

        <div>
          <h2 className="logo">Employer Panel</h2>
        </div>

        <div className="nav-links">

          <button
            onClick={() => navigate("/employer/dashboard")}
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/employer/create-tender")}
          >
            + Create Tender
          </button>

          <button
            onClick={() => navigate("/employer/my-tenders")}
          >
            My Tenders
          </button>

        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="dashboard-header">

        <h1>Employer Dashboard</h1>

        <p className="welcome-text">
          Welcome, {user?.name || user?.username || "Employer"}
        </p>

      </div>

      {/* ================= STATS ================= */}
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Total Tenders</h3>
          <h1>{tenders.length}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Open Tenders</h3>

          <h1>
            {
              tenders.filter(
                (tender) => tender.status === "OPEN"
              ).length
            }
          </h1>
        </div>

        <div className="dashboard-card">
          <h3>Awarded Tenders</h3>

          <h1>
            {
              tenders.filter(
                (tender) => tender.status === "AWARDED"
              ).length
            }
          </h1>
        </div>

      </div>

      {/* ================= TENDERS ================= */}
      <div className="dashboard-section">

        <h2>My Posted Tenders</h2>

        {tenders.length === 0 ? (

          <div className="empty-state">

            <p>No tenders created yet.</p>

            <button
              onClick={() =>
                navigate("/employer/create-tender")
              }
            >
              Create Your First Tender
            </button>

          </div>

        ) : (

          <div className="tender-grid">

            {tenders.map((tender) => (

              <div
                key={tender.id}
                className="tender-card"
              >

                <h3>
                  {tender.title || "Untitled Tender"}
                </h3>

                <p>
                  <strong>Category:</strong>{" "}
                  {tender.category || "N/A"}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {tender.description || "No description"}
                </p>

                <p>
                  <strong>Budget:</strong>{" "}
                  KES {tender.budget || 0}
                </p>

                <p>
                  <strong>Deadline:</strong>{" "}
                  {tender.deadline || "N/A"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {tender.status || "OPEN"}
                </p>

                {/* ================= WINNER ================= */}
                {tender.status === "AWARDED" &&
                  tender.winning_bid && (

                  <div className="winner-box">

                    <h4>🏆 Winning Contractor</h4>

                    <p>
                      <strong>Bid Amount:</strong>{" "}
                      KES {
                        tender.winning_bid.bid_amount || 0
                      }
                    </p>

                    <p>
                      <strong>Score:</strong>{" "}
                      {
                        tender.winning_bid
                          .evaluation_score || 0
                      }
                    </p>

                    <p>
                      <strong>Contractor:</strong>{" "}
                      {
                        tender.winning_bid.contractor
                          ?.name || "N/A"
                      }
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {
                        tender.winning_bid.contractor
                          ?.email || "N/A"
                      }
                    </p>

                  </div>
                )}

                {/* ================= ACTIONS ================= */}
                <div className="actions">

                  <button
                    onClick={() =>
                      navigate(
                        `/employer/tenders/${tender.id}/bids`
                      )
                    }
                  >
                    View Bids
                  </button>

                  {tender.status === "OPEN" && (
                    <button disabled>
                      Awaiting System Evaluation
                    </button>
                  )}

                  {tender.status === "AWARDED" && (
                    <button disabled>
                      Tender Awarded
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}