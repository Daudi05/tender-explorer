import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RoleGuard({ role }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <p>Loading...</p>
  }

  // User not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Wrong role
  if (user?.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  // Correct role
  return <Outlet />
}