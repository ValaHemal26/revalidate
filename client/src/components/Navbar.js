// ============================
// Navbar Component
// ============================
// Shows different navigation links based on the user's role.

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Handle logout: clear auth state and go to home page
  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <span>🚌</span> BusBook
        </Link>

        {/* Navigation links change based on role */}
        <div className="navbar-links">
          {!user ? (
            <>
              {/* Not logged in: show Login and Register */}
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : user.role === "user" ? (
            <>
              {/* Regular user: search and bookings */}
              <Link to="/search">Search</Link>
              <Link to="/my-bookings">My Bookings</Link>
              <button className="nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : user.role === "operator" ? (
            <>
              {/* Bus operator: manage buses */}
              <Link to="/operator/dashboard">Dashboard</Link>
              <Link to="/operator/add-bus">Add Bus</Link>
              <Link to="/operator/manage-buses">My Buses</Link>
              <button className="nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : user.role === "admin" ? (
            <>
              {/* Admin: manage everything */}
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/buses">Buses</Link>
              <button className="nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
