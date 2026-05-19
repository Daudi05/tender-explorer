import "../stub.css"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "../../api/client"
import { formatKES } from "../../utils/formatters"

export default function TenderDetail() {
  const { id } = useParams()

  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(false)

  // BID FORM STATE
  const [form, setForm] = useState({
    bid_amount: "",
    proposal_summary: "",
    completion_months: ""
  })

  useEffect(() => {
    fetchTender()
  }, [])

  async function fetchTender() {
    try {
      setLoading(true)

      const data = await apiFetch(`/api/tenders/${id}`)
      setTender(data.tender)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function submitBid() {
  try {
    const payload = {
      tender_id: id,
      bid_amount: Number(form.bid_amount),
      proposal_summary: form.proposal_summary?.trim(),
      completion_months: Number(form.completion_months),
    }

    console.log("SUBMIT PAYLOAD:", payload)

    await apiFetch("/api/bids", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    alert("Bid submitted successfully")

    setForm({
      bid_amount: "",
      proposal_summary: "",
      completion_months: "",
    })

  } catch (error) {
    console.error("FULL ERROR:", error)

    alert(
      error?.details
        ? JSON.stringify(error.details)
        : error?.error || "Bid failed"
    )
  }
}

  if (loading || !tender) {
    return <p>Loading...</p>
  }

  return (
    <div className="dashboard-page">

      <h1>{tender.title}</h1>
      <p>{tender.description}</p>

      <h2>{formatKES(tender.budget)}</h2>

      <p><strong>Deadline:</strong> {tender.deadline}</p>

      <hr />

      {/* ================= BID FORM ================= */}
      <h3>Submit Full Bid Proposal</h3>

      <div className="bid-form">

        <input
          type="number"
          name="bid_amount"
          placeholder="Bid Amount (KES)"
          value={form.bid_amount}
          onChange={handleChange}
        />

        <textarea
          name="proposal_summary"
          placeholder="Describe your proposal / approach"
          value={form.proposal_summary}
          onChange={handleChange}
        />

        <input
          type="number"
          name="completion_months"
          placeholder="Estimated completion (months)"
          value={form.completion_months}
          onChange={handleChange}
        />

        <button onClick={submitBid}>
          Submit Bid
        </button>

      </div>

    </div>
  )
}