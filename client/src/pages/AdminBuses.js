// ============================
// Admin Buses Page
// ============================

import React, { useState, useEffect } from "react";
import { getAdminBuses, deleteAdminBus } from "../services/api";

function AdminBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBuses(); }, []);

  const fetchBuses = async () => {
    try {
      const res = await getAdminBuses();
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
      await deleteAdminBus(id);
      fetchBuses();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });

  if (loading) return <div className="loading">Loading buses...</div>;

  return (
    <div>
      <h1 className="page-title">All Buses</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>Bus Name</th>
            <th>Operator</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Seats</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus._id}>
              <td><strong>{bus.busName}</strong></td>
              <td>{bus.operatorId?.name || "N/A"}</td>
              <td>{bus.from} → {bus.to}</td>
              <td>{formatDate(bus.departureTime)}</td>
              <td>{bus.totalSeats}</td>
              <td>₹{bus.price}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bus._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBuses;
