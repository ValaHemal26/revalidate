"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { fetchBuses, deleteBus, updateBus } from "../../admin/utils/api";

interface Bus {
  _id: string;
  busName: string;
  busNumber: string;
  busType: string;
  totalSeats: number;
  basePrice: number;
  isActive: boolean;
  departureTime: string;
  arrivalTime: string;
  scheduleType: string;
  route: any;
}

export default function ManageBuses() {
  const router = useRouter();
  const token = Cookies.get("token");

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadBuses();
  }, [token, router]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBuses(token!);
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load buses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (busId: string, busName: string) => {
    if (!confirm(`Are you sure you want to delete "${busName}"?`)) return;

    try {
      setDeletingId(busId);
      await deleteBus(busId, token!);
      setBuses((prev) => prev.filter((b) => b._id !== busId));
      setSuccess(`Bus "${busName}" deleted successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete bus");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (busId: string, currentState: boolean, busName: string) => {
    try {
      setActioningId(busId);
      const updatedBus = await updateBus(busId, { isActive: !currentState }, token!);
      setBuses((prev) => prev.map((bus) => (bus._id === busId ? { ...bus, isActive: updatedBus.isActive } : bus)));
      setSuccess(`Bus "${busName}" is now ${updatedBus.isActive ? "active" : "inactive"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update bus status");
    } finally {
      setActioningId(null);
    }
  };

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "ACTIVE" && bus.isActive) ||
      (filterType === "INACTIVE" && !bus.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Manage Buses</h1>
            <p className="header-subtitle">View and manage all buses in your fleet</p>
          </div>
          <div className="header-right">
            <Link href="/admin/add-bus" className="btn btn-primary">
              ➕ Add New Bus
            </Link>
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

          {/* Search & Filter */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-body">
              <div className="search-filter-section">
                <div className="search-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by bus name or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-control"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Buses ({buses.length})</option>
                  <option value="ACTIVE">Active ({buses.filter((b) => b.isActive).length})</option>
                  <option value="INACTIVE">Inactive ({buses.filter((b) => !b.isActive).length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buses List */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading buses...</p>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🚌</div>
                <div className="empty-state-title">
                  {buses.length === 0 ? "No buses found" : "No buses match your search"}
                </div>
                <div className="empty-state-description">
                  {buses.length === 0
                    ? "Create your first bus to get started managing your fleet"
                    : "Try adjusting your search or filter criteria"}
                </div>
                {buses.length === 0 && (
                  <Link href="/admin/add-bus" className="btn btn-primary">
                    Add First Bus
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bus Name</th>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Seats</th>
                    <th>Price</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map((bus) => (
                    <tr key={bus._id}>
                      <td>
                        <strong>{bus.busName}</strong>
                      </td>
                      <td>{bus.busNumber}</td>
                      <td>
                        <span className="badge badge-primary">{bus.busType}</span>
                      </td>
                      <td>{bus.totalSeats}</td>
                      <td>₹{bus.basePrice.toLocaleString()}</td>
                      <td style={{ fontSize: "12px" }}>{bus.scheduleType}</td>
                      <td>
                        <span
                          className={`badge ${bus.isActive ? "badge-success" : "badge-danger"}`}
                        >
                          {bus.isActive ? "● Active" : "● Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/admin/buses/${bus._id}`}>
                            <button className="btn btn-secondary btn-sm">Edit</button>
                          </Link>
                          <button
                            onClick={() => handleToggleActive(bus._id, bus.isActive, bus.busName)}
                            className={bus.isActive ? "btn btn-warning btn-sm" : "btn btn-success btn-sm"}
                            disabled={actioningId === bus._id}
                          >
                            {actioningId === bus._id ? "..." : bus.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(bus._id, bus.busName)}
                            className="btn btn-danger btn-sm"
                            disabled={deletingId === bus._id}
                          >
                            {deletingId === bus._id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
      