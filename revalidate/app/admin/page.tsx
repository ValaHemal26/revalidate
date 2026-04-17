"use client";
import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fleet");

  useEffect(() => {
    // Basic mock fetch for auth token if available, using empty token for demo
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      // In a real app we pass the Authorization header with Admin/Operator JWT token here
      const res = await fetch("http://localhost:5000/api/v1/buses/search?source=All&destination=All&date=2026-04-13");
      // For demo, just get any buses from a search or real fleet endpoint if token is bypassed
      // const res = await fetch("http://localhost:5000/api/v1/fleet"); 
      if (res.ok) {
        const data = await res.json();
        setBuses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container search-results-page">
      <div className="search-header glass-panel">
        <h2>Operator Dashboard</h2>
        <p className="text-muted">Manage your Fleet and Bookings</p>
      </div>

      <div className="search-layout">
        <aside className="filters-sidebar glass-panel">
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{ padding: "12px", cursor: "pointer", fontWeight: activeTab === "fleet" ? "bold" : "normal", color: activeTab === "fleet" ? "var(--accent-primary)" : "inherit" }}
              onClick={() => setActiveTab("fleet")}
            >
              Fleet Management
            </li>
            <li
              style={{ padding: "12px", cursor: "pointer", fontWeight: activeTab === "bookings" ? "bold" : "normal", color: activeTab === "bookings" ? "var(--accent-primary)" : "inherit" }}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings
            </li>
            <li
              style={{ padding: "12px", cursor: "pointer", fontWeight: activeTab === "analytics" ? "bold" : "normal", color: activeTab === "analytics" ? "var(--accent-primary)" : "inherit" }}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </li>
          </ul>
        </aside>

        <div className="bus-list">
          {activeTab === "fleet" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3>Active Fleet</h3>
                <button className="btn btn-primary">Add New Bus</button>
              </div>

              {loading ? <p>Loading fleet...</p> : (
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "12px 0" }}>Bus Name</th>
                      <th>Number</th>
                      <th>Type</th>
                      <th>Seats</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Demo rows or real data */}
                    {buses.length > 0 ? buses.map((b: any) => (
                      <tr key={b._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "16px 0" }}>{b.busName}</td>
                        <td>{b.busNumber}</td>
                        <td>{b.busType}</td>
                        <td>{b.totalSeats}</td>
                        <td style={{ color: "var(--accent-success)" }}>Active</td>
                        <td>
                          <button className="btn" style={{ padding: "6px 12px", background: "var(--bg-tertiary)" }}>Edit</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "16px 0", textAlign: "center" }}>No buses found in fleet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3>Recent Bookings</h3>
              <p className="text-muted">No recent bookings to show.</p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3>Revenue Analytics</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
                <div style={{ padding: "24px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <h4 style={{ color: "var(--text-muted)", marginBottom: "8px" }}>Total Revenue</h4>
                  <h2 style={{ color: "var(--accent-primary)" }}>₹0</h2>
                </div>
                <div style={{ padding: "24px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <h4 style={{ color: "var(--text-muted)", marginBottom: "8px" }}>Total Bookings</h4>
                  <h2 style={{ color: "var(--accent-primary)" }}>0</h2>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
