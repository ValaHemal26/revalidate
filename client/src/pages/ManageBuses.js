// ============================
// Manage Buses Page (Operator)
// ============================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOperatorBuses, deleteBus } from "../services/api";

function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBuses(); }, []);

  const fetchBuses = async () => {
    try {
      const res = await getOperatorBuses();
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bus?")) return;
    try {
      await deleteBus(id);
      fetchBuses();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Manage My Buses</h1>

      {buses.length === 0 ? (
        <div className="empty-state">
          <span>🚌</span>
          <p>No buses. <Link to="/operator/add-bus">Add one!</Link></p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Bus Name</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Seats</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus._id}>
                <td><strong>{bus.busName}</strong></td>
                <td>{bus.from} → {bus.to}</td>
                <td>{formatDate(bus.departureTime)}</td>
                <td>{bus.totalSeats}</td>
                <td>₹{bus.price}</td>
                <td>
                  <div className="actions">
                    <Link to={`/operator/bookings/${bus._id}`} className="btn btn-secondary btn-sm">Bookings</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bus._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageBuses;
