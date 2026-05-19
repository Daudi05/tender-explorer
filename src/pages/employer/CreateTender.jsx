import '../stub.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'

export default function CreateTender() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiFetch('/api/tenders', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          budget: Number(form.budget),
          deadline: new Date(form.deadline).toISOString(),
        }),
      })
      navigate('/employer/my-tenders')
    } catch (err) {
      setError(err.message || 'Failed to create tender')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-tender-container">
      <div className="create-tender-header">
        <h1>Create Tender</h1>
        <p>Fill in the details below to publish a new tender</p>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <form className="create-tender-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          name="title"
          placeholder="Enter tender title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe the project requirements"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <input
          name="category"
          placeholder="e.g Construction, IT, Supplies"
          value={form.category}
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <div>
            <label>Budget (KES)</label>
            <input
              name="budget"
              type="number"
              min="0"
              placeholder="Enter budget"
              value={form.budget}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Deadline</label>
            <input
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Tender'}
        </button>
      </form>
    </div>
  )
}
