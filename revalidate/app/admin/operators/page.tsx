"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { fetchOperators, approveOperator } from "../../admin/utils/api";

interface Operator {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function OperatorsPage() {
  const router = useRouter();
  const token = Cookies.get("token");

  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadOperators();
  }, [token, router]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await fetchOperators(token!);
      setOperators(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load operators");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (operatorId: string, operatorName: string) => {
    try {
      setActioningId(operatorId);
      await approveOperator(operatorId, "approve", token!);
      setOperators((prev) =>
        prev.map((o) =>
          o._id === operatorId ? { ...o, isActive: true } : o
        )
      );
      setSuccess(`${operatorName} approved successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to approve operator");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (operatorId: string, operatorName: string, isDeactivating = false) => {
    const actionLabel = isDeactivating ? "deactivate" : "reject";
    if (!confirm(`Are you sure you want to ${actionLabel} ${operatorName}?`)) return;

    try {
      setActioningId(operatorId);
      await approveOperator(operatorId, "reject", token!);
      setOperators((prev) =>
        prev.map((o) =>
          o._id === operatorId ? { ...o, isActive: false } : o
        )
      );
      setSuccess(
        isDeactivating ? `${operatorName} deactivated` : `${operatorName} rejected`,
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update operator status");
    } finally {
      setActioningId(null);
    }
  };

  const filteredOperators = operators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (operator.phone || "").includes(searchTerm);

    const matchesFilter =
      filterStatus === "ALL" ||
      (filterStatus === "APPROVED" && operator.isActive) ||
      (filterStatus === "PENDING" && !operator.isActive);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: operators.length,
    approved: operators.filter((o) => o.isActive).length,
    pending: operators.filter((o) => !o.isActive).length,
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Manage Operators</h1>
            <p className="header-subtitle">Approve or reject operator applications</p>
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
                <div className="stat-icon primary">👥</div>
                <div className="stat-label">Total Operators</div>
                <div className="stat-value">{stats.total}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✓</div>
                <div className="stat-label">Approved</div>
                <div className="stat-value">{stats.approved}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">⏱️</div>
                <div className="stat-label">Inactive</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
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
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Operators ({operators.length})</option>
                  <option value="APPROVED">Approved ({stats.approved})</option>
                  <option value="PENDING">Inactive ({stats.pending})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Operators List */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading operators...</p>
            </div>
          ) : filteredOperators.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">
                  {operators.length === 0 ? "No operators yet" : "No operators match your search"}
                </div>
                <div className="empty-state-description">
                  {operators.length === 0
                    ? "Operator applications will appear here when users apply"
                    : "Try adjusting your search or filter criteria"}
                </div>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperators.map((operator) => (
                    <tr key={operator._id}>
                      <td>
                        <strong>{operator.name}</strong>
                      </td>
                      <td style={{ fontSize: "12px" }}>{operator.email}</td>
                      <td>{operator.phone || "N/A"}</td>
                      <td style={{ fontSize: "12px" }}>
                        {new Date(operator.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`badge ${operator.isActive ? "badge-success" : "badge-warning"}`}
                        >
                          {operator.isActive ? "✓ Active" : "⏱️ Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {!operator.isActive ? (
                            <>
                              <button
                                onClick={() => handleApprove(operator._id, operator.name)}
                                className="btn btn-success btn-sm"
                                disabled={actioningId === operator._id}
                              >
                                {actioningId === operator._id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(operator._id, operator.name)}
                                className="btn btn-danger btn-sm"
                                disabled={actioningId === operator._id}
                              >
                                {actioningId === operator._id ? "..." : "Reject"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReject(operator._id, operator.name, true)}
                              className="btn btn-warning btn-sm"
                              disabled={actioningId === operator._id}
                            >
                              {actioningId === operator._id ? "..." : "Deactivate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info */}
          {!loading && filteredOperators.length > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "var(--text-secondary)" }}>
              Showing {filteredOperators.length} of {operators.length} operators
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
