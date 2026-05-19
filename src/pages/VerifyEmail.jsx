import { Link } from "react-router-dom";
import "./stub.css";

export default function VerifyEmail() {
  return (
    <div className="verify-page">
      <div className="verify-card">
        <h1>Verify Email</h1>

        <p>
          Verification email sent successfully.
        </p>

        <Link to="/login" className="primary-btn">
          Back To Login
        </Link>
      </div>
    </div>
  );
}