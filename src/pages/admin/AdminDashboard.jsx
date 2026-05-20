import "../stub.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    flagged_bids: 0,
    pending_documents: 0,
    registered_users: 0,
    active_tenders: 0,
  });

  const [fraudAlerts, setFraudAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================================
  // FETCH DASHBOARD DATA
  // =========================================

  useEffect(() => {

    fetchDashboard();

    // AUTO REFRESH EVERY 5 SECONDS
    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // =========================================
  // API CALL
  // =========================================

  async function fetchDashboard() {

    try {

      setLoading(true);

      const response = await apiFetch(
        "/admin/dashboard"
      );

      console.log("ADMIN DASHBOARD:", response);

      setStats({
        flagged_bids: response.stats.flagged_bids,
        pending_documents: response.stats.pending_documents,
        registered_users: response.stats.registered_users,
        active_tenders: response.stats.active_tenders,
      });

      setFraudAlerts(
        response.fraud_alerts || []
      );

    } catch (error) {

      console.error(
        "Dashboard fetch error:",
        error
      );

    } finally {

      setLoading(false);
    }
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
        }}
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>

        <p>
          Monitor fraud alerts,
          documents, and platform activity.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="admin-actions">

        <div
          className="admin-action-card"
          onClick={() =>
            navigate("/admin/verify-documents")
          }
        >
          <h3>Verify Documents</h3>
          <p>Review contractor uploads</p>
        </div>

        <div
          className="admin-action-card"
          onClick={() =>
            navigate("/admin/flagged-bids")
          }
        >
          <h3>Flagged Bids</h3>
          <p>Review suspicious activity</p>
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <p>Loading dashboard...</p>
      )}

      {/* STATS */}
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Flagged Bids</h3>
          <h1>{stats.flagged_bids}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Pending Documents</h3>
          <h1>{stats.pending_documents}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Registered Users</h3>
          <h1>{stats.registered_users}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Active Tenders</h3>
          <h1>{stats.active_tenders}</h1>
        </div>

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

            {fraudAlerts.length === 0 ? (

              <tr>
                <td colSpan="4">
                  No fraud alerts
                </td>
              </tr>

            ) : (

              fraudAlerts.map((item, index) => (

                <tr key={index}>

                  <td>
                    {item.contractor}
                  </td>

                  <td>
                    {item.tender}
                  </td>

                  <td>
                    {item.fraud_score}
                  </td>

                  <td>
                    {item.status}
                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}