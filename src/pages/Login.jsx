import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./stub.css"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = await login(formData.email, formData.password)
      const role = data.user.role
      if (role === "CONTRACTOR") navigate("/contractor/dashboard")
      else if (role === "EMPLOYER") navigate("/employer/dashboard")
      else if (role === "ADMIN") navigate("/admin/dashboard")
      else navigate("/")
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="card-subtitle">Sign in to your TenderExplorer account</p>

        {error && (
          <div className="toast toast-error">
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="auth-text">
          No account?{" "}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
