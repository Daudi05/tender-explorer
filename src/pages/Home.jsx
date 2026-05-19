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

      {/* ── HERO ── */}
      <div className="hero-section">
        <div className="hero-badge">🚀 Procurement, reimagined</div>

        <h1>
          The smarter way<br />
          to <span className="highlight">win contracts</span>
        </h1>

        <p>
          Post tenders, submit bids, and let our automated scoring
          engine find the best match — fairly, transparently, every time.
        </p>

        <div className="hero-actions">
          {!isAuthenticated ? (
            <>
              <button className="btn-primary" onClick={() => navigate("/register")}>
                Start for free →
              </button>
              <button className="btn-ghost" onClick={() => navigate("/login")}>
                Log in
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={goToDashboard}>
              Go to Dashboard →
            </button>
          )}
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <strong>3</strong>
            <span>User Roles</span>
          </div>
          <div className="stat-item">
            <strong>Auto</strong>
            <span>Bid Scoring</span>
          </div>
          <div className="stat-item">
            <strong>100%</strong>
            <span>Transparent</span>
          </div>
          <div className="stat-item">
            <strong>Instant</strong>
            <span>Notifications</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="home-content">

        {/* Role Cards */}
        <div className="role-section">
          <div className="section-tag">✦ Who it's for</div>
          <h2 className="section-heading">Built for every stakeholder</h2>
          <p className="section-sub">
            Whether you're posting a tender, bidding on a contract, or overseeing
            platform integrity — we've got a tailored experience for you.
          </p>

          <div className="role-grid">
            <div className="role-card">
              <div className="role-icon">🏢</div>
              <h3>Employers</h3>
              <p>
                Create and publish tenders, review incoming bids,
                and award contracts with one click.
              </p>
              <button onClick={() => navigate("/login")}>
                Employer login →
              </button>
            </div>

            <div className="role-card">
              <div className="role-icon">👷</div>
              <h3>Contractors</h3>
              <p>
                Browse open tenders, submit competitive bids,
                and track your awards in real time.
              </p>
              <button onClick={() => navigate("/login")}>
                Contractor login →
              </button>
            </div>

            <div className="role-card">
              <div className="role-icon">🛡️</div>
              <h3>Admins</h3>
              <p>
                Verify users, review flagged bids, and ensure
                the platform stays fair and fraud-free.
              </p>
              <button onClick={() => navigate("/login")}>
                Admin access →
              </button>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="how-it-works">
          <div className="section-tag">✦ How it works</div>
          <h2 className="section-heading">Four steps to a contract</h2>
          <p className="section-sub">
            From posting to award, the entire procurement process is
            streamlined and automated.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Post Tender</h4>
              <p>Employers create and publish tender opportunities with budget and deadline.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h4>Submit Bids</h4>
              <p>Contractors submit detailed proposals, pricing, and completion timelines.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h4>Auto Evaluation</h4>
              <p>Our scoring engine ranks bids by price, speed, reputation, and integrity.</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h4>Award Contract</h4>
              <p>The winning bid is selected and all parties are instantly notified.</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="cta-banner">
          <h2>Ready to find your next contract?</h2>
          <p>Join employers and contractors already using TenderExplorer.</p>
          <button className="btn-white" onClick={() => navigate("/register")}>
            Create free account →
          </button>
        </div>

      </div>
    </div>
  )
}
