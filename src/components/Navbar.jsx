import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import NotificationBell from "./NotificationBell"
import "./Navbar.css"

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        TenderExplorer
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Home
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Log in
            </NavLink>
            <NavLink to="/register" className="nav-link nav-cta">
              Get started
            </NavLink>
          </>
        )}

        {user && (
          <>
            <NotificationBell />
            <button className="logout" onClick={logout}>
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
