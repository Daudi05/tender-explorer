import "../stub.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../api/client"

export default function AwardLetters() {
  const navigate = useNavigate()

  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAwardLetters() {
      try {
        const data = await apiFetch("/api/award-letters/my")

        setLetters(
          Array.isArray(data)
            ? data
            : data.award_letters || []
        )
      } catch (err) {
        setError(err.message || "Failed to load award letters")
      } finally {
        setLoading(false)
      }
    }

    fetchAwardLetters()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading award letters...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div
          className="toast toast-error"
          style={{ marginBottom: "1rem" }}
        >
          ✕ {error}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      {/* BACK BUTTON */}
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

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>My Award Letters</h1>
        <p>
          View and download award letters sent for tenders you have won
        </p>
      </div>

      {/* EMPTY STATE */}
      {letters.length === 0 ? (
        <div className="dashboard-section">
          <h3>No award letters yet</h3>
          <p>
            Once you win a tender and the employer uploads an award letter,
            it will appear here.
          </p>
        </div>
      ) : (
        <div className="dashboard-section">

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Tender</th>
                <th>Employer</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {letters.map((letter) => (
                <tr key={letter.id}>

                  <td style={{ fontWeight: 600 }}>
                    {letter.tender_title}
                  </td>

                  <td>
                    {letter.employer_name || "Employer"}
                  </td>

                  <td>
                    {letter.created_at
                      ? new Date(letter.created_at).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    <a
                      href={letter.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "var(--color-primary)",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        display: "inline-block",
                      }}
                    >
                      Download PDF
                    </a>
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