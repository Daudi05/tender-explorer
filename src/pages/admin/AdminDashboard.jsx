import "../stub.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: "Flagged Bids", value: 14 },
    { title: "Pending Documents", value: 9 },
    { title: "Registered Users", value: 340 },
    { title: "Active Tenders", value: 71 },
  ];

  const fraudAlerts = [
    {
      contractor: "BuildCorp Ltd",
      tender: "Road Construction",
      score: "82%",
      status: "Flagged",
    },
    {
      contractor: "Metro Supplies",
      tender: "Hospital Equipment",
      score: "67%",
      status: "Review",
    },
    {
      contractor: "Skyline Ventures",
      tender: "Bridge Construction",
      score: "91%",
      status: "Flagged",
    },
  ];

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
          e.target.style.background = "#f3f4f6";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "white";
        }}
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor fraud alerts, documents, and platform activity.</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="admin-actions">
        <div
          className="admin-action-card"
          onClick={() => navigate("/admin/verify-documents")}
        >
          <h3>Verify Documents</h3>
          <p>Review contractor uploads</p>
        </div>

        <div
          className="admin-action-card"
          onClick={() => navigate("/admin/flagged-bids")}
        >
          <h3>Flagged Bids</h3>
          <p>Review suspicious activity</p>
        </div>
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

      {/* TABLE */}
      <div className="dashboard-section">
        <h2>Recent Fraud Alerts</h2>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Contractor</th>
              <th>Tender</th>
              <th>Fraud Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {fraudAlerts.map((item, index) => (
              <tr key={index}>
                <td>{item.contractor}</td>
                <td>{item.tender}</td>
                <td>{item.score}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}