import '../stub.css'

import { useState } from "react"
import axios from "axios"

export default function CreateTender() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: ""
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      await axios.post(
        "http://localhost:5000/api/tenders",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Tender created successfully")
    } catch (err) {
      console.log(err.response?.data)
      alert("Failed to create tender")
    }
  }

  return (
    <div>
      <h1>Create Tender</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          onChange={handleChange}
        />

        <input
          name="budget"
          type="number"
          placeholder="Budget"
          onChange={handleChange}
        />

        <input
          name="deadline"
          type="datetime-local"
          onChange={handleChange}
        />

        <button type="submit">
          Create Tender
        </button>
      </form>
    </div>
  )
}