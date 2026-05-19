import { Navigate } from "react-router-dom"
import Home from "../pages/Home"

export default function NavigateToDashboard() {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (!token) {
    return <Home />
  }

  if (role === "EMPLOYER") {
    return <Navigate to="/employer/dashboard" replace />
  }

  if (role === "CONTRACTOR") {
    return <Navigate to="/contractor/dashboard" replace />
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Home />
}