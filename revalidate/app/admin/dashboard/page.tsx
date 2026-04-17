"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import "../../assets/css/admin-modern.css";
import { fetchDashboard, fetchBuses, fetchBookings } from "../../admin/utils/api";
import Link from "next/link";

interface DashboardStats {
  totalBuses: number;
  activeBuses: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings?: number;
  cancelledBookings?: number;
}

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
}

interface Booking {
  _id: string;
  passengerName?: string;
  name?: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    activeBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
  });
  const [recentBuses, setRecentBuses] = useState<Bus[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const [dashboardData, busesData, bookingsData] = await Promise.all([
        fetchDashboard(token),
        fetchBuses(token),
        fetchBookings(token),
      ]);

      // Sort and get recent data
      const sortedBuses = Array.isArray(busesData) ? busesData.sort((a: any, b: any) => 
        new Date((b.createdAt as any) || 0).getTime() - new Date((a.createdAt as any) || 0).getTime()
      ).slice(0, 5) : [];
      
      const sortedBookings = Array.isArray(bookingsData) ? bookingsData.sort((a: any, b: any) => 
        new Date((b.createdAt as any) || 0).getTime() - new Date((a.createdAt as any) || 0).getTime()
      ).slice(0, 5) : [];

      setRecentBuses(sortedBuses);
      setRecentBookings(sortedBookings);

      // Calculate stats
      const activeBuses = busesData.filter((b: any) => b.isActive).length;
      const totalRevenue = bookingsData.reduce((sum: number, b: any) => {
        if (b.status?.toLowerCase() === "confirmed" || b.status?.toLowerCase() === "booked") {
          return sum + (b.price || b.totalPrice || 0);
        }
        return sum;
      }, 0);
      const pendingBookings = bookingsData.filter((b: any) => b.status?.toLowerCase() === "pending").length;
      const cancelledBookings = bookingsData.filter((b: any) => b.status?.toLowerCase() === "cancelled").length;

      setStats({
        totalBuses: busesData.length,
        activeBuses,
        totalBookings: bookingsData.length,
        totalRevenue,
        pendingBookings,
        cancelledBookings,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("admin");
    router.push("/admin/login");
  };

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

  const admin = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName={admin.name || "Admin"} />

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Dashboard</h1>
            <p className="header-subtitle">Welcome back, Administrator 👋</p>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="user-avatar">{admin.name?.charAt(0)?.toUpperCase() || "A"}</div>
              <div>
                <div className="user-name">{admin.name || "Admin"}</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
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

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">🚌</div>
                  <div className="stat-label">Total Buses</div>
                  <div className="stat-value">{stats.totalBuses}</div>
                  <div className="stat-change positive">
                    {stats.activeBuses} active
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon success">✓</div>
                  <div className="stat-label">Total Bookings</div>
                  <div className="stat-value">{stats.totalBookings}</div>
                  <div className="stat-change positive">
                    {stats.pendingBookings} pending
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning">💰</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">₹{stats.totalRevenue?.toLocaleString()}</div>
                  <div className="stat-change positive">
                    From {stats.totalBookings} bookings
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon danger">✕</div>
                  <div className="stat-label">Cancelled</div>
                  <div className="stat-value">{stats.cancelledBookings}</div>
                  <div className="stat-change negative">
                    {stats.cancelledBookings > 0 ? "Action required" : "None"}
                  </div>
                </div>
              </div>

              {/* Recent Buses */}
              <div className="card" style={{ marginBottom: "30px" }}>
                <div className="card-header">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Recent Buses</h3>
                    <Link href="/admin/buses" className="btn btn-secondary btn-sm">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {recentBuses.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🚌</div>
                      <div className="empty-state-title">No buses added yet</div>
                      <div className="empty-state-description">Create your first bus to get started</div>
                      <Link href="/admin/add-bus" className="btn btn-primary">
                        Add New Bus
                      </Link>
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
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBuses.map((bus) => (
                            <tr key={bus._id}>
                              <td>
                                <strong>{bus.busName}</strong>
                              </td>
                              <td>{bus.busNumber}</td>
                              <td>{bus.busType}</td>
                              <td>{bus.totalSeats}</td>
                              <td>₹{bus.basePrice}</td>
                              <td>
                                <span
                                  className={`badge ${bus.isActive ? "badge-success" : "badge-danger"}`}
                                >
                                  {bus.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="card">
                <div className="card-header">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Recent Bookings</h3>
                    <Link href="/admin/bookings" className="btn btn-secondary btn-sm">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {recentBookings.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No bookings yet</div>
                      <div className="empty-state-description">
                        Bookings will appear here once customers make reservations
                      </div>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Passenger</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Travel Date</th>
                            <th>Price</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((booking) => (
                            <tr key={booking._id}>
                              <td>
                                <strong>{booking.name || booking.passengerName}</strong>
                              </td>
                              <td style={{ fontSize: "12px" }}>{booking.email}</td>
                              <td>{booking.phone}</td>
                              <td>
                                {new Date(booking.travelDate).toLocaleDateString("en-IN")}
                              </td>
                              <td>₹{booking.price?.toLocaleString()}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeColor(booking.status)}`}>
                                  {getStatusLabel(booking.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
         