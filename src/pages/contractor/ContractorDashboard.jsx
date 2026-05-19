import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"
import "../stub.css"

export default function ContractorDashboard() {
  const [tenders, setTenders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTenders() {
      try {
        const data = await apiFetch("/api/tenders")

        console.log("API RESPONSE:", data)

        setTenders(data.tenders || [])
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }

    fetchTenders()
  }, [])

  const stats = [
    { title: "Available Tenders", value: tenders.length },
    { title: "Awards Won", value: 6 },
    { title: "Reputation Score", value: "92%" },
    { title: "Current Ranking", value: "#3" },
  ]

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <h1>Contractor Dashboard</h1>

        <p>
          Browse available tenders and track contractor performance.
        </p>
      </div>

      {/* STATS */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <h3>{stat.title}</h3>
            <h1>{stat.value}</h1>
          </div>
        ))}
      </div>

      {/* AVAILABLE TENDERS */}
      <div className="dashboard-section">
        <h2>Available Tenders</h2>

        {tenders.length === 0 ? (
          <p>No tenders available</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td>{tender.title}</td>
                  <td>{tender.description}</td>
                  <td>KES {tender.budget}</td>
                  <td>{tender.deadline}</td>

                  {/* ✅ NEW: BID BUTTON */}
                  <td>
                    <button
                      onClick={() =>
                        navigate(`/contractor/tenders/${tender.id}`)
                      }
                    >
                      Place Bid
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}