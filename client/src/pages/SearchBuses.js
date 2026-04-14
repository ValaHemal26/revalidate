// ============================
// Search Buses Page (User)
// ============================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchBuses, getAllBuses } from "../services/api";

function SearchBuses() {
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Load all buses on first visit
  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const res = await getAllBuses();
      setBuses(res.data);
    } catch (err) {
      console.error("Failed to load buses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search with filters
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchBuses({ from, to, date });
      setBuses(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <h1 className="page-title">Search Buses</h1>

      {/* Search Form */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input type="text" className="form-input" placeholder="From (city)"
          value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="text" className="form-input" placeholder="To (city)"
          value={to} onChange={(e) => setTo(e.target.value)} />
        <input type="date" className="form-input" value={date}
          onChange={(e) => setDate(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-secondary" onClick={() => { setFrom(""); setTo(""); setDate(""); loadBuses(); }}>
          Clear
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="loading">Searching buses...</div>
      ) : buses.length === 0 ? (
        <div className="empty-state">
          <span>🔍</span>
          <p>No buses found. Try different search criteria.</p>
        </div>
      ) : (
        <div className="bus-grid">
          {buses.map((bus) => (
            <div key={bus._id} className="card bus-card">
              <div className="bus-card-header">
                <h3>{bus.busName}</h3>
                <div className="bus-price">₹{bus.price}</div>
              </div>
              <div className="bus-route">
                <strong>{bus.from}</strong>
                <span className="arrow">→</span>
                <strong>{bus.to}</strong>
              </div>
              <div className="bus-time">
                🕐 {formatDate(bus.departureTime)} — {formatDate(bus.arrivalTime)}
              </div>
              <div className="bus-card-footer">
                <span className="seats-badge">{bus.totalSeats} seats</span>
                <Link to={`/book/${bus._id}`} className="btn btn-primary btn-sm">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBuses;
