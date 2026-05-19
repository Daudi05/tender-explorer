import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

export default function TenderBids() {
  const { id } = useParams()
  const [tender, setTender] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    axios.get(`http://localhost:5000/api/tenders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setTender(res.data))
  }, [id])

  if (!tender) return <p>Loading...</p>

  const winner = tender.bids.find(b => b.is_winner)

  return (
    <div>
      <h2>{tender.title}</h2>

      <h3>Bids</h3>
      {tender.bids.map(b => (
        <div key={b.id}>
          <p>Amount: {b.bid_amount}</p>
          <p>Score: {b.evaluation_score}</p>
          <p>Contractor: {b.contractor.name}</p>
        </div>
      ))}

      <h3>Winner</h3>
      {winner ? (
        <div>
          {winner.contractor.name} ({winner.contractor.email})
        </div>
      ) : (
        <p>No winner yet</p>
      )}
    </div>
  )
}
