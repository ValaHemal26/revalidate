// ============================
// Add Bus Page (Operator)
// ============================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBus } from "../services/api";

function AddBus() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    busName: "", from: "", to: "",
    departureTime: "", arrivalTime: "",
    totalSeats: "", price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addBus({
        ...form,
        totalSeats: Number(form.totalSeats),
        price: Number(form.price),
      });
      navigate("/operator/manage-buses");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add bus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 className="page-title">Add New Bus</h1>
      <div className="card" style={{ padding: 32 }}>
        {error && <div className="notification error" style={{ position: "static", marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bus Name / Number</label>
            <input type="text" name="busName" className="form-input" value={form.busName}
              onChange={handleChange} required placeholder="Express 101" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>From</label>
              <input type="text" name="from" className="form-input" value={form.from}
                onChange={handleChange} required placeholder="Mumbai" />
            </div>
            <div className="form-group">
              <label>To</label>
              <input type="text" name="to" className="form-input" value={form.to}
                onChange={handleChange} required placeholder="Pune" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Departure Time</label>
              <input type="datetime-local" name="departureTime" className="form-input"
                value={form.departureTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Arrival Time</label>
              <input type="datetime-local" name="arrivalTime" className="form-input"
                value={form.arrivalTime} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Total Seats</label>
              <input type="number" name="totalSeats" className="form-input" value={form.totalSeats}
                onChange={handleChange} required min="1" max="100" placeholder="40" />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" className="form-input" value={form.price}
                onChange={handleChange} required min="0" placeholder="500" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Adding..." : "Add Bus"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBus;
