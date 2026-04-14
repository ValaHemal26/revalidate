// ============================
// Protected Route Component
// ============================
// Wraps pages that require authentication.
// Redirects to login if not logged in.
// Checks role if a specific role is required.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Wait until auth state is loaded
  if (loading) return <div className="loading">Loading...</div>;

  // Not logged in → go to login page
  if (!user) return <Navigate to="/login" />;

  // Wrong role → go to home page
  if (role && user.role !== role) return <Navigate to="/" />;

  // All good → render the protected page
  return children;
}

export default ProtectedRoute;
