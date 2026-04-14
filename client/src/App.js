// ============================
// App Component - Main Router
// ============================
// Sets up all the routes and wraps the app with AuthProvider.

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import Navbar from "./components/Navbar";
import Notification from "./components/Notification";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import SearchBuses from "./pages/SearchBuses";
import BookBus from "./pages/BookBus";
import MyBookings from "./pages/MyBookings";

// Operator pages
import OperatorDashboard from "./pages/OperatorDashboard";
import AddBus from "./pages/AddBus";
import ManageBuses from "./pages/ManageBuses";
import BusBookings from "./pages/BusBookings";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminBuses from "./pages/AdminBuses";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes - anyone can access */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User routes - only "user" role */}
            <Route path="/search" element={<ProtectedRoute role="user"><SearchBuses /></ProtectedRoute>} />
            <Route path="/book/:busId" element={<ProtectedRoute role="user"><BookBus /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute role="user"><MyBookings /></ProtectedRoute>} />

            {/* Operator routes - only "operator" role */}
            <Route path="/operator/dashboard" element={<ProtectedRoute role="operator"><OperatorDashboard /></ProtectedRoute>} />
            <Route path="/operator/add-bus" element={<ProtectedRoute role="operator"><AddBus /></ProtectedRoute>} />
            <Route path="/operator/manage-buses" element={<ProtectedRoute role="operator"><ManageBuses /></ProtectedRoute>} />
            <Route path="/operator/bookings/:busId" element={<ProtectedRoute role="operator"><BusBookings /></ProtectedRoute>} />

            {/* Admin routes - only "admin" role */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/buses" element={<ProtectedRoute role="admin"><AdminBuses /></ProtectedRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
