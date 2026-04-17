"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { fetchBookings, cancelBooking } from "../../admin/utils/api";

interface Booking {
  _id: string;
  name?: string;
  passengerName?: string;
  email: string;
  phone: string;
  busId: any;
  seatNumber: string;
  travelDate: string;
  status: string;
  price: number;
  verificationCode?: string;
  createdAt?: string;
}

export default function Bookings() {
  const router = useRouter();
  const token = Cookies.get("token");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadBookings();
  }, [token, router]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings(token!);
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string, passengerName: string) => {
    if (!confirm(`Are you sure you want to cancel the booking for ${passengerName}?`)) return;

    try {
      setCancelingId(bookingId);
      await cancelBooking(bookingId, token!);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      setSuccess("Booking cancelled successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setCancelingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const passengerName = booking.name || booking.passengerName || "";
    const matchesSearch =
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "ALL" ||
      booking.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    const st = status?.toLowerCase();
    if (st === "confirmed" || st === "booked") return "badge-success";
    if (st === "pending") return "badge-warning";
    if (st === "cancelled") return "badge-danger";
    return "badge-primary";
  };

  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status?.toLowerCase() === "confirmed" || b.status?.toLowerCase() === "booked").length,
    pending: bookings.filter((b) => b.status?.toLowerCase() === "pending").length,
    cancelled: bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length,
    revenue: bookings
      .filter((b) => b.status?.toLowerCase() === "confirmed" || b.status?.toLowerCase() === "booked")
      .reduce((sum, b) => sum + (b.price || 0), 0),
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Bookings</h1>
            <p className="header-subtitle">Manage all bus bookings and customer reservations</p>
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
                <div className="stat-icon primary">📋</div>
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{stats.total}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✓</div>
                <div className="stat-label">Confirmed</div>
                <div className="stat-value">{stats.confirmed}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">⏱️</div>
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon danger">✕</div>
                <div className="stat-label">Cancelled</div>
                <div className="stat-value">{stats.cancelled}</div>
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
                    placeholder="Search by name, email, phone or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Bookings ({bookings.length})</option>
                  <option value="CONFIRMED">Confirmed ({stats.confirmed})</option>
                  <option value="BOOKED">Booked ({stats.confirmed})</option>
                  <option value="PENDING">Pending ({stats.pending})</option>
                  <option value="CANCELLED">Cancelled ({stats.cancelled})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">
                  {bookings.length === 0 ? "No bookings yet" : "No bookings match your search"}
                </div>
                <div className="empty-state-description">
                  {bookings.length === 0
                    ? "Bookings will appear here once customers make reservations"
                    : "Try adjusting your search or filter criteria"}
                </div>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Passenger Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Seat</th>
                    <th>Travel Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>{booking.name || booking.passengerName || "N/A"}</strong>
                      </td>
                      <td style={{ fontSize: "12px" }}>{booking.email}</td>
                      <td>{booking.phone}</td>
                      <td>
                        <span className="badge badge-primary">{booking.seatNumber}</span>
                      </td>
                      <td>
                        {new Date(booking.travelDate).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <strong>₹{booking.price?.toLocaleString()}</strong>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() =>
                              handleCancel(
                                booking._id,
                                booking.name || booking.passengerName || "Customer"
                              )
                            }
                            className="btn btn-danger btn-sm"
                            disabled={
                              cancelingId === booking._id ||
                              booking.status?.toLowerCase() === "cancelled"
                            }
                          >
                            {cancelingId === booking._id
                              ? "..."
                              : booking.status?.toLowerCase() === "cancelled"
                              ? "Cancelled"
                              : "Cancel"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Info */}
          {!loading && filteredBookings.length > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "var(--text-secondary)" }}>
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
          