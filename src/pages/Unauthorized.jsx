import { Link, useNavigate } from "react-router-dom";
import "./stub.css";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <h1>403</h1>

        <h2>Unauthorized Access</h2>

        <p>
          You do not have permission to access this page.
          This may happen if your account role is not allowed
          or your session has expired.
        </p>

        <div className="unauthorized-actions">
          <Link to="/" className="primary-btn">
            Go Home
          </Link>

          <Link to="/login" className="secondary-btn">
            Login
          </Link>

          {/* quick retry navigation */}
          <button
            onClick={() => navigate(-1)}
            className="secondary-btn"
          >
            Go Back
          </button>
        </div>

      
      </div>
    </div>
  );
}