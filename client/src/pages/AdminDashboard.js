// ============================
// Admin Dashboard
// ============================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBuses: 0, totalBookings: 0, totalOperators: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{stats.totalOperators}</div>
          <div className="stat-label">Operators</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{stats.totalBuses}</div>
          <div className="stat-label">Buses</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{stats.totalBookings}</div>
          <div className="stat-label">Bookings</div>
        </div>
      </div>

      <div className="actions">
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
        <Link to="/admin/buses" className="btn btn-secondary">Manage Buses</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
