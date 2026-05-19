import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function TenderCard({ tender }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role === "CONTRACTOR") {
      navigate(`/contractor/tenders/${tender.id}`)
    }

    if (user.role === "EMPLOYER") {
      navigate(`/employer/tenders/${tender.id}/bids`)
    }
  }

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <h3>{tender.title}</h3>
      <p>{tender.category}</p>
      <p>{tender.budget}</p>
    </div>
  )
}