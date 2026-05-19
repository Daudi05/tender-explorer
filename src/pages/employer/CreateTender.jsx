import "../stub.css"

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

      setForm({
        title: "",
        description: "",
        category: "",
        budget: "",
        deadline: ""
      })

    } catch (err) {
      console.log(err.response?.data)
      alert("Failed to create tender")
    }
  }

  return (
    <div className="create-tender-container">

      {/* HEADER */}
      <div className="create-tender-header">
        <h1>Create Tender</h1>
        <p>Fill in the details below to publish a new tender</p>
      </div>

      {/* FORM */}
      <form className="create-tender-form" onSubmit={handleSubmit}>

        <label>Title</label>
        <input
          name="title"
          placeholder="Enter tender title"
          value={form.title}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe the project requirements"
          value={form.description}
          onChange={handleChange}
        />

        <label>Category</label>
        <input
          name="category"
          placeholder="e.g Construction, IT, Supplies"
          value={form.category}
          onChange={handleChange}
        />

        <div className="form-row">

          <div>
            <label>Budget (KES)</label>
            <input
              name="budget"
              type="number"
              placeholder="Enter budget"
              value={form.budget}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Deadline</label>
            <input
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

        </div>

        <button type="submit">
          Create Tender
        </button>

      </form>

    </div>
  )
}