// ============================
// Register Page
// ============================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h1>Register</h1>
        {error && <div className="notification error" style={{ position: "static", marginBottom: 16 }}>{error}</div>}
        {success && <div className="notification success" style={{ position: "static", marginBottom: 16 }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" className="form-input" value={form.name}
              onChange={handleChange} required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-input" value={form.email}
              onChange={handleChange} required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-input" value={form.password}
              onChange={handleChange} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>Register as</label>
            <select name="role" className="form-input form-select" value={form.role} onChange={handleChange}>
              <option value="user">Passenger (User)</option>
              <option value="operator">Bus Operator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
