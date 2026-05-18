import { useEffect, useState } from "react"
import { getMyBids } from "../../services/bidService"

export default function MyBids() {

  const [bids, setBids] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await getMyBids(token)

      setBids(res.data.bids)

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <h1>My Bids</h1>

      {bids.map((bid) => (
        <div key={bid.id}>
          <p>Amount: {bid.bid_amount}</p>
          <p>Status: {bid.status}</p>
          <p>Fraud: {bid.fraud_score}</p>
        </div>
      ))}
    </div>
  )
}