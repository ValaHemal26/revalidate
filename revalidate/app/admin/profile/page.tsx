"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { getAdminProfile, updateAdminProfile } from "../../admin/utils/api";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const token = Cookies.get("token");

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadProfile();
  }, [token, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getAdminProfile(token!);
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setUpdating(true);
      const data = await updateAdminProfile(formData, token!);
      setProfile(data.admin);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar userRole="ADMIN" userName="Admin" />
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="header-title">My Profile</h1>
          </div>
          <div className="dashboard-content">
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName={profile?.name || "Admin"} />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">My Profile</h1>
            <p className="header-subtitle">Manage your admin account settings</p>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-message">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          <div className="card" style={{ maxWidth: "600px" }}>
            <div className="card-header">
              <h3>👤 Profile Information</h3>
            </div>

            <form onSubmit={handleSubmit} className="card-body">
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Profile Picture</label>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                >
                  {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number (optional)"
                />
              </div>

              <div
                style={{
                  background: "var(--bg-secondary)",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  fontSize: "13px",
                }}
              >
                <div style={{ color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <strong>Role:</strong> {profile?.role || "Admin"}
                </div>
                <div style={{ color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <strong>Status:</strong> {profile?.isActive ? "Active" : "Inactive"}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>
                  <strong>Member Since:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN") : "N/A"}
                </div>
              </div>
            </form>

            <div className="card-footer">
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="btn btn-secondary"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
                onClick={handleSubmit}
              >
                {updating ? (
                  <>
                    <span className="loader"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
