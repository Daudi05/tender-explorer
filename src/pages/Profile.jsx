import { useEffect, useState } from "react"
import { apiFetch } from "../api/client"
import "./stub.css"

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", phone: "", role: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => setUser(data.user || data))
      .catch((err) => setMessage({ type: "error", text: err.message || "Failed to load profile" }))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (message) setMessage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const data = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: user.name, phone: user.phone }),
      })
      setUser(data.user || data)
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="stub-page"><h2>Loading profile…</h2></div>

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>My Profile</h1>
        <p className="profile-subtitle">Update your name and phone number</p>

        {message && (
          <div className={`toast toast-${message.type}`}>
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-group">
            <label>Full name</label>
            <input type="text" name="name" value={user.name} onChange={handleChange} placeholder="Full name" />
          </div>
          <div className="profile-group">
            <label>Email address</label>
            <input type="email" value={user.email} disabled placeholder="Email" />
          </div>
          <div className="profile-group">
            <label>Phone number</label>
            <input type="tel" name="phone" value={user.phone || ""} onChange={handleChange} placeholder="Phone number" />
          </div>
          <div className="profile-group">
            <label>Role</label>
            <input type="text" value={user.role} disabled placeholder="Role" />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes →"}
          </button>
        </form>
      </div>
    </div>
  )
}
