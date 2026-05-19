import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Home.css"

const BENTO_FEATURES = [
  {
    icon: "⚡",
    title: "Instant Bid Scoring",
    desc: "Every bid is scored automatically on price, speed, and integrity — results in seconds, not days.",
    extra: "scores",
    cls: "bento-card-wide",
  },
  {
    icon: "🛡️",
    title: "Fraud Detection",
    desc: "AI-assisted flagging catches suspicious patterns before they cost you.",
    cls: "bento-card-accent",
  },
  {
    icon: "🔔",
    title: "Real-time Alerts",
    desc: "Every milestone — bid received, award made, document approved — goes out instantly.",
    cls: "",
  },
  {
    icon: "📄",
    title: "Document Vault",
    desc: "Upload, store, and verify compliance documents with admin-controlled approval workflows. Full audit trail on every file.",
    cls: "bento-card-tall",
  },
  {
    icon: "🏆",
    title: "Auto-Award Engine",
    desc: "At 10 bids the system evaluates and awards automatically.",
    cls: "",
  },
  {
    icon: "📋",
    title: "Tender Management",
    desc: "Create, track, and close tenders with a single workflow built for procurement.",
    cls: "",
  },
]

const MARQUEE_ITEMS = [
  "Smart Procurement", "Auto-Award", "Fraud Detection", "Real-time Bids",
  "Document Vault", "Instant Notifications", "Transparent Scoring", "KE-ready",
  "Smart Procurement", "Auto-Award", "Fraud Detection", "Real-time Bids",
  "Document Vault", "Instant Notifications", "Transparent Scoring", "KE-ready",
]

export default function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  function goToDashboard() {
    if (!user) return navigate("/login")
    if (user.role === "EMPLOYER")    return navigate("/employer/dashboard")
    if (user.role === "CONTRACTOR")  return navigate("/contractor/dashboard")
    if (user.role === "ADMIN")       return navigate("/admin/dashboard")
    navigate("/login")
  }

  return (
    <div className="home-page">

      {/* ─────────── HERO ─────────── */}
      <section className="hero">
        {/* LEFT copy */}
        <div className="hero-copy">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            Kenya's Procurement Platform
          </div>

          <h1 className="hero-heading">
            Win contracts<br />
            <span className="word-outline">faster</span> &amp;<br />
            <span className="word-gradient">smarter</span>
          </h1>

          <p className="hero-desc">
            Post tenders, submit competitive bids, and let our automated
            scoring engine find the best match — fairly, transparently,
            every single time.
          </p>

          <div className="hero-ctas">
            {!isAuthenticated ? (
              <>
                <button className="btn-hero-primary" onClick={() => navigate("/register")}>
                  Start for free →
                </button>
                <button className="btn-hero-ghost" onClick={() => navigate("/login")}>
                  Log in
                </button>
              </>
            ) : (
              <button className="btn-hero-primary" onClick={goToDashboard}>
                Go to Dashboard →
              </button>
            )}
          </div>

          <div className="hero-proof">
            <div className="proof-avatars">
              <div className="proof-avatar">EK</div>
              <div className="proof-avatar">JM</div>
              <div className="proof-avatar">AO</div>
              <div className="proof-avatar">LN</div>
            </div>
            <div className="proof-text">
              <strong>Employers &amp; contractors</strong> already using TenderExplorer
            </div>
          </div>
        </div>

        {/* RIGHT visual — floating mock UI cards */}
        <div className="hero-visual" aria-hidden="true">

          {/* main card — open tender */}
          <div className="mock-card mock-card-main">
            <div className="mock-card-label">Open Tender</div>
            <div className="mock-card-title">Road Construction — Nairobi Bypass Extension</div>
            <div className="mock-card-row">
              <span className="mock-kes">KES 12.4M</span>
              <span className="mock-badge mock-badge-open">OPEN</span>
            </div>
            <div className="mock-meter">
              <div className="mock-meter-fill" style={{ width: "70%" }} />
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
              7 of 10 bids received
            </div>
          </div>

          {/* top-right — score card */}
          <div className="mock-card mock-card-sm-1">
            <div className="mock-card-label">Top Bid Score</div>
            <div className="mock-stat-big">94.2</div>
            <div className="mock-stat-label">Evaluation score</div>
            <div className="mock-icon-row">
              <div className="mock-dot" style={{ background: "#4ade80" }} />
              <div className="mock-dot" style={{ background: "#4ade80" }} />
              <div className="mock-dot" style={{ background: "#4ade80" }} />
              <div className="mock-dot" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>
          </div>

          {/* bottom-right — award card */}
          <div className="mock-card mock-card-sm-2">
            <div className="mock-card-label">Latest Award</div>
            <div className="mock-card-title">Hospital Equipment Supply</div>
            <div style={{ marginTop: "0.5rem" }}>
              <span className="mock-badge mock-badge-award">AWARDED</span>
            </div>
          </div>

          {/* top-left — notifications */}
          <div className="mock-card mock-card-sm-3">
            <div className="mock-card-label">Notifications</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" }}>
              {["New bid received", "Document verified", "Tender awarded"].map((t) => (
                <div key={t} style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span style={{ color: "#4ade80", fontSize: "0.6rem" }}>●</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── MARQUEE ─────────── */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─────────── METRICS ─────────── */}
      <div className="metrics-section">
        <div className="metric-item">
          <div className="metric-number"><span className="metric-accent">3</span></div>
          <div className="metric-label">User Roles</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">10<span className="metric-accent">x</span></div>
          <div className="metric-label">Faster Evaluation</div>
        </div>
        <div className="metric-item">
          <div className="metric-number"><span className="metric-accent">100</span>%</div>
          <div className="metric-label">Transparent</div>
        </div>
        <div className="metric-item">
          <div className="metric-number"><span className="metric-accent">∞</span></div>
          <div className="metric-label">Tenders Supported</div>
        </div>
      </div>

      {/* ─────────── BENTO FEATURES ─────────── */}
      <section className="bento-section">
        <div className="bento-header">
          <div className="section-eyebrow">✦ Platform features</div>
          <h2 className="bento-heading">
            Everything you need,<br /><em>nothing you don't</em>
          </h2>
        </div>

        <div className="bento-grid">
          {BENTO_FEATURES.map((f) => (
            <div key={f.title} className={`bento-card ${f.cls || ""}`}>
              <div className="bento-card-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>

              {/* inline score visualiser inside the wide bid-scoring card */}
              {f.extra === "scores" && (
                <div className="bento-mini-score">
                  {[
                    { label: "Price",     fill: 88, val: "88%" },
                    { label: "Timeline",  fill: 72, val: "72%" },
                    { label: "Integrity", fill: 95, val: "95%" },
                  ].map((s) => (
                    <div key={s.label} className="bento-score-bar">
                      <span className="bento-score-label">{s.label}</span>
                      <div className="bento-score-track">
                        <div className="bento-score-fill" style={{ width: s.fill + "%" }} />
                      </div>
                      <span className="bento-score-val">{s.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── ROLES ─────────── */}
      <section className="roles-section">
        <div className="section-eyebrow">✦ Who it's for</div>
        <h2 className="bento-heading">Built for <em>every</em> stakeholder</h2>

        <div className="roles-grid">
          <div className="role-card-v2 role-card-employer" data-num="01">
            <span className="role-icon-v2">🏢</span>
            <h3>Employers</h3>
            <p>Post tenders and manage your procurement pipeline in one place.</p>
            <ul>
              <li><span className="role-check">✓</span> Create &amp; publish tenders instantly</li>
              <li><span className="role-check">✓</span> Review scored &amp; ranked bids</li>
              <li><span className="role-check">✓</span> Award with one click + legal letter</li>
              <li><span className="role-check">✓</span> Real-time bid notifications</li>
            </ul>
            <button onClick={() => navigate("/login")}>Employer login →</button>
          </div>

          <div className="role-card-v2 role-card-contractor" data-num="02">
            <span className="role-icon-v2">👷</span>
            <h3>Contractors</h3>
            <p>Find the right tenders, submit compelling bids, win contracts.</p>
            <ul>
              <li><span className="role-check">✓</span> Browse all open tenders</li>
              <li><span className="role-check">✓</span> Submit proposals with documents</li>
              <li><span className="role-check">✓</span> Track your bids &amp; awards</li>
              <li><span className="role-check">✓</span> See your evaluation score</li>
            </ul>
            <button onClick={() => navigate("/login")}>Contractor login →</button>
          </div>

          <div className="role-card-v2 role-card-admin" data-num="03">
            <span className="role-icon-v2">🛡️</span>
            <h3>Admins</h3>
            <p>Oversee the platform, verify documents, keep procurement fair.</p>
            <ul>
              <li><span className="role-check">✓</span> Verify contractor documents</li>
              <li><span className="role-check">✓</span> Review &amp; resolve flagged bids</li>
              <li><span className="role-check">✓</span> Monitor platform activity</li>
              <li><span className="role-check">✓</span> Full audit trail</li>
            </ul>
            <button onClick={() => navigate("/login")}>Admin access →</button>
          </div>
        </div>
      </section>

      {/* ─────────── TIMELINE ─────────── */}
      <section className="timeline-section">
        <div className="section-eyebrow">✦ How it works</div>
        <h2 className="bento-heading">From post to award<br />in <em>four steps</em></h2>

        <div className="timeline-grid">
          {/* step 1 — left */}
          <div className="timeline-item-left">
            <div className="timeline-step-num">Step 01</div>
            <h4>Post a Tender</h4>
            <p>Employers create a tender with budget, category, deadline, and requirements. Published instantly to all contractors.</p>
          </div>
          <div className="timeline-line" />
          <div /> {/* empty right */}

          {/* step 2 — right */}
          <div /> {/* empty left */}
          <div />
          <div className="timeline-item-right">
            <div className="timeline-step-num">Step 02</div>
            <h4>Submit Bids</h4>
            <p>Contractors browse open tenders, upload documents, set their price and timeline, and submit a proposal.</p>
          </div>

          {/* step 3 — left */}
          <div className="timeline-item-left">
            <div className="timeline-step-num">Step 03</div>
            <h4>Automatic Evaluation</h4>
            <p>Our scoring engine ranks every bid by price competitiveness, timeline efficiency, and fraud integrity score.</p>
          </div>
          <div />
          <div />

          {/* step 4 — right */}
          <div />
          <div />
          <div className="timeline-item-right">
            <div className="timeline-step-num">Step 04</div>
            <h4>Award the Contract</h4>
            <p>The employer selects the winner, uploads an award letter, confirms — and every bidder is notified immediately.</p>
          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="cta-section">
        <div className="cta-block">
          <div className="cta-watermark">TenderExplorer</div>
          <div className="cta-inner">
            <h2>Ready for your<br /><em>next contract?</em></h2>
            <p>
              Join employers and contractors already running their procurement
              on TenderExplorer. Free to start, no credit card required.
            </p>
            {!isAuthenticated ? (
              <button className="btn-cta" onClick={() => navigate("/register")}>
                Create free account →
              </button>
            ) : (
              <button className="btn-cta" onClick={goToDashboard}>
                Go to Dashboard →
              </button>
            )}
            <div className="cta-subtext">Free · No credit card · Kenya-first</div>
          </div>
        </div>
      </section>

    </div>
  )
}
