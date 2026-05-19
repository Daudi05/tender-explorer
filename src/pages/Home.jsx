import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Home.css"

export default function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  function goToDashboard() {
    if (!user) return navigate("/login")

    if (user.role === "EMPLOYER") return navigate("/employer/dashboard")
    if (user.role === "CONTRACTOR") return navigate("/contractor/dashboard")
    if (user.role === "ADMIN") return navigate("/admin/dashboard")

    navigate("/login")
  }

  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <div className="hero-section">
        <h1>Smart Tender Management System</h1>

        <p>
          A platform where employers post tenders, contractors submit bids,
          and the system automatically evaluates and awards contracts fairly.
        </p>

        <div className="hero-actions">
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/login")}>
                Login
              </button>

              <button onClick={() => navigate("/register")}>
                Create Account
              </button>
            </>
          ) : (
            <button onClick={goToDashboard}>
              Go to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ROLE CARDS */}
      <div className="role-section">

        <h2>Who is this platform for?</h2>

        <div className="role-grid">

          <div className="role-card">
            <h3>🏢 Employers</h3>
            <p>
              Post tenders, review bids, and monitor awarded contracts.
            </p>
            <button onClick={() => navigate("/login")}>
              Employer Login
            </button>
          </div>

          <div className="role-card">
            <h3>👷 Contractors</h3>
            <p>
              Browse available tenders, submit bids, and track opportunities.
            </p>
            <button onClick={() => navigate("/login")}>
              Contractor Login
            </button>
          </div>

          <div className="role-card">
            <h3>🛡️ Admin</h3>
            <p>
              Verify users, monitor flagged bids, and ensure system integrity.
            </p>
            <button onClick={() => navigate("/login")}>
              Admin Access
            </button>
          </div>

        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-it-works">

        <h2>How it works</h2>

        <div className="steps">

          <div className="step">
            <h4>1. Post Tender</h4>
            <p>Employers create and publish tender opportunities.</p>
          </div>

          <div className="step">
            <h4>2. Submit Bids</h4>
            <p>Contractors submit detailed proposals and pricing.</p>
          </div>

          <div className="step">
            <h4>3. System Evaluation</h4>
            <p>Automated scoring evaluates all submitted bids.</p>
          </div>

          <div className="step">
            <h4>4. Award Contract</h4>
            <p>The best bid is selected and awarded automatically.</p>
          </div>

        </div>
      </div>

    </div>
  )
}