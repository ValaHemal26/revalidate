// ============================
// Home Page
// ============================
// Landing page with hero section and feature highlights.

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>Book Your Bus Ticket Online</h1>
        <p>Search hundreds of routes, compare prices, and book your seat in seconds.</p>
        {!user ? (
          <Link to="/register" className="btn">Get Started →</Link>
        ) : user.role === "user" ? (
          <Link to="/search" className="btn">Search Buses →</Link>
        ) : user.role === "operator" ? (
          <Link to="/operator/dashboard" className="btn">Go to Dashboard →</Link>
        ) : (
          <Link to="/admin/dashboard" className="btn">Admin Panel →</Link>
        )}
      </section>

      {/* Features */}
      <div className="features-grid">
        <div className="card feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Easy Search</h3>
          <p>Find buses by route and date with our simple search tool.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">💺</div>
          <h3>Choose Your Seat</h3>
          <p>Pick your preferred seat from the interactive seat map.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🎫</div>
          <h3>Instant Booking</h3>
          <p>Book your ticket instantly and view your booking history anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
