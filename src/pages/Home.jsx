import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api/client"
import "./Home.css"

export default function Home() {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const data = await apiFetch("/api/tenders")
        setTenders(data?.tenders || [])
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [])

  if (loading) return <p>Loading tenders...</p>

  return (
    <div className="home-container">

      <h1 className="home-title">Available Tenders</h1>

      <div className="tender-grid">

        {tenders.length === 0 ? (
          <p>No tenders available</p>
        ) : (
          tenders.map((tender) => (
            <div key={tender.id} className="tender-card">

              <h3>{tender.title}</h3>

              <p className="basic-info">
                {tender.category} • ${tender.budget}
              </p>

              {/* HIDDEN DETAILS (HOVER EFFECT) */}
              <div className="hover-info">
                <p><strong>Description:</strong></p>
                <p>{tender.description}</p>

                <p><strong>Deadline:</strong> {tender.deadline}</p>

                <p><strong>Status:</strong> {tender.status}</p>
              </div>

              {/* VIEW DETAILS BUTTON (OPTION B) */}
              <button
                className="view-btn"
                onClick={() =>
                  navigate(`/contractor/tenders/${tender.id}`)
                }
              >
                View Details
              </button>

            </div>
          ))
        )}

      </div>

    </div>
  )
}