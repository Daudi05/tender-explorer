import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">

      {/* LEFT - APP NAME */}
      <div className="logo" onClick={() => navigate("/")}>
        Tender Explorer
      </div>

      {/* NAV LINKS */}
      <div className="nav-links">

        <NavLink to="/" className="nav-link">
          Home
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>

            <NavLink to="/register" className="nav-link">
              Register
            </NavLink>
          </>
        )}

        {user && (
          <button className="nav-link logout" onClick={logout}>
            Logout
          </button>
        )}

      </div>

    </nav>
  )
}