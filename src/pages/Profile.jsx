import { useEffect, useState } from "react"
import { apiFetch } from "../api/client"
import "./stub.css"

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", phone: "", role: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((data) => setUser(data.user || data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = await apiFetch("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: user.name, phone: user.phone }),
      })
      setUser(data.user || data)
      alert("Profile updated")
    } catch (err) {
      alert(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="stub-page"><h2>Loading profile...</h2></div>

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" value={user.name} onChange={handleChange} placeholder="Full Name" />
          <input type="email" value={user.email} disabled placeholder="Email" />
          <input type="tel" name="phone" value={user.phone || ""} onChange={handleChange} placeholder="Phone Number" />
          <input type="text" value={user.role} disabled placeholder="Role" />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
    </div>
  )
}
