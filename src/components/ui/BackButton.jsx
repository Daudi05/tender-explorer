import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        background: "white",
        cursor: "pointer",
        fontWeight: "600",
        marginBottom: "16px",
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
  );
}