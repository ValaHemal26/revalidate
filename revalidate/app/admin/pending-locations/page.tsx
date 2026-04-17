"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { getPendingLocations, approveLocation } from "../../admin/utils/api";

interface Location {
  _id: string;
  name: string;
  fullName?: string;
  cityId?: string;
  cityName?: string;
  state?: string;
  status: string;
  type?: string;
  createdAt: string;
}

export default function PendingLocationsPage() {
  const router = useRouter();
  const token = Cookies.get("token");

  const [locations, setLocations] = useState({
    cities: [] as Location[],
    points: [] as Location[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cities" | "points">("cities");

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadLocations();
  }, [token, router]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getPendingLocations(token!);
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load locations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (locationId: string, locationType: "city" | "point", locationName: string) => {
    try {
      setActioningId(locationId);
      await approveLocation(locationId, locationType, "approve", token!);

      setLocations((prev) => ({
        ...prev,
        [locationType === "city" ? "cities" : "points"]: prev[
          locationType === "city" ? "cities" : "points"
        ].map((loc) =>
          loc._id === locationId ? { ...loc, status: "APPROVED" } : loc
        ),
      }));

      setSuccess(`${locationName} approved successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to approve location");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (locationId: string, locationType: "city" | "point", locationName: string) => {
    if (!confirm(`Are you sure you want to reject ${locationName}?`)) return;

    try {
      setActioningId(locationId);
      await approveLocation(locationId, locationType, "reject", token!);

      setLocations((prev) => ({
        ...prev,
        [locationType === "city" ? "cities" : "points"]: prev[
          locationType === "city" ? "cities" : "points"
        ].map((loc) =>
          loc._id === locationId ? { ...loc, status: "REJECTED" } : loc
        ),
      }));

      setSuccess(`${locationName} rejected`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reject location");
    } finally {
      setActioningId(null);
    }
  };
    const pendingCities = (locations.cities || []).filter(
    (c) => c.status === "PENDING"
    );

    const pendingPoints = (locations.points || []).filter(
    (p) => p.status === "PENDING"
    );

    const stats = {
        totalCities: (locations.cities || []).length,
        totalPoints: (locations.points || []).length,
        pendingCities: pendingCities.length,
        pendingPoints: pendingPoints.length,
    };

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Pending Locations</h1>
            <p className="header-subtitle">Approve or reject new cities and pickup points</p>
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

          {/* Stats Grid */}
          {!loading && (
            <div className="stats-grid" style={{ marginBottom: "20px" }}>
              <div className="stat-card">
                <div className="stat-icon primary">🏙️</div>
                <div className="stat-label">Pending Cities</div>
                <div className="stat-value">{stats.pendingCities}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon secondary">📍</div>
                <div className="stat-label">Pending Points</div>
                <div className="stat-value">{stats.pendingPoints}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✓</div>
                <div className="stat-label">Total Cities</div>
                <div className="stat-value">{stats.totalCities}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✓</div>
                <div className="stat-label">Total Points</div>
                <div className="stat-value">{stats.totalPoints}</div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ marginBottom: "20px", display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)" }}>
            <button
              onClick={() => setActiveTab("cities")}
              style={{
                padding: "12px 16px",
                background: activeTab === "cities" ? "var(--primary-light)" : "transparent",
                border: "none",
                borderBottom: activeTab === "cities" ? "2px solid var(--secondary)" : "none",
                color: activeTab === "cities" ? "var(--secondary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === "cities" ? "600" : "500",
              }}
            >
              🏙️ Cities ({pendingCities.length})
            </button>
            <button
              onClick={() => setActiveTab("points")}
              style={{
                padding: "12px 16px",
                background: activeTab === "points" ? "var(--primary-light)" : "transparent",
                border: "none",
                borderBottom: activeTab === "points" ? "2px solid var(--secondary)" : "none",
                color: activeTab === "points" ? "var(--secondary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === "points" ? "600" : "500",
              }}
            >
              📍 Points ({pendingPoints.length})
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading locations...</p>
            </div>
          ) : activeTab === "cities" ? (
            // Cities Tab
            pendingCities.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🏙️</div>
                  <div className="empty-state-title">No pending cities</div>
                  <div className="empty-state-description">
                    All city applications have been reviewed
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>City Name</th>
                      <th>State</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCities.map((city) => (
                      <tr key={city._id}>
                        <td>
                          <strong>{city.name}</strong>
                        </td>
                        <td>{city.state || "N/A"}</td>
                        <td>
                          <span className="badge badge-warning">⏱️ Pending</span>
                        </td>
                        <td style={{ fontSize: "12px" }}>
                          {new Date(city.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => handleApprove(city._id, "city", city.name)}
                              className="btn btn-success btn-sm"
                              disabled={actioningId === city._id}
                            >
                              {actioningId === city._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(city._id, "city", city.name)}
                              className="btn btn-danger btn-sm"
                              disabled={actioningId === city._id}
                            >
                              {actioningId === city._id ? "..." : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // Points Tab
            pendingPoints.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📍</div>
                  <div className="empty-state-title">No pending points</div>
                  <div className="empty-state-description">
                    All pickup point applications have been reviewed
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Point Name</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPoints.map((point) => (
                      <tr key={point._id}>
                        <td>
                          <strong>{point.fullName || point.name}</strong>
                        </td>
                        <td>{point.cityName || "N/A"}</td>
                        <td>
                          <span className="badge badge-warning">⏱️ Pending</span>
                        </td>
                        <td style={{ fontSize: "12px" }}>
                          {new Date(point.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => handleApprove(point._id, "point", point.fullName || point.name)}
                              className="btn btn-success btn-sm"
                              disabled={actioningId === point._id}
                            >
                              {actioningId === point._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(point._id, "point", point.fullName || point.name)}
                              className="btn btn-danger btn-sm"
                              disabled={actioningId === point._id}
                            >
                              {actioningId === point._id ? "..." : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
