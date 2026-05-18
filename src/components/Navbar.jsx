import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Tender Explorer
      </Link>

      <div className="nav-links">

        {user?.role === 'EMPLOYER' && (
          <>
            <Link to="/employer/dashboard">Dashboard</Link>
            <Link to="/employer/my-tenders">My Tenders</Link>
            <Link to="/employer/create-tender">Create Tender</Link>
          </>
        )}

        {user?.role === 'CONTRACTOR' && (
          <>
            <Link to="/contractor/dashboard">Dashboard</Link>
            <Link to="/contractor/browse">Browse</Link>
            <Link to="/contractor/my-bids">My Bids</Link>
          </>
        )}

      </div>

      <div className="nav-right">
        {user ? (
          <button onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}