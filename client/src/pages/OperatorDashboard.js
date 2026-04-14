// ============================
// Operator Dashboard
// ============================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOperatorBuses } from "../services/api";

function OperatorDashboard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getOperatorBuses();
        setBuses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="page-title">Operator Dashboard</h1>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-number">{buses.length}</div>
          <div className="stat-label">My Buses</div>
        </div>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link to="/operator/add-bus" className="btn btn-primary">+ Add New Bus</Link>
        <Link to="/operator/manage-buses" className="btn btn-secondary">Manage Buses</Link>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : buses.length === 0 ? (
        <div className="empty-state">
          <span>🚌</span>
          <p>No buses added yet. Add your first bus!</p>
        </div>
      ) : (
        <div className="bus-grid">
          {buses.slice(0, 4).map((bus) => (
            <div key={bus._id} className="card bus-card">
              <h3>{bus.busName}</h3>
              <div className="bus-route">
                <strong>{bus.from}</strong> <span className="arrow">→</span> <strong>{bus.to}</strong>
              </div>
              <div className="bus-card-footer">
                <span className="seats-badge">{bus.totalSeats} seats</span>
                <Link to={`/operator/bookings/${bus._id}`} className="btn btn-secondary btn-sm">View Bookings</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OperatorDashboard;
