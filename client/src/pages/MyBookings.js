// ============================
// My Bookings Page (User)
// ============================

import React, { useState, useEffect } from "react";
import { getMyBookings, cancelBooking } from "../services/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed.");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div>
      <h1 className="page-title">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span>🎫</span>
          <p>No bookings yet. Search for a bus and book a seat!</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Seat</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.busId?.busName || "N/A"}</td>
                <td>{b.busId?.from} → {b.busId?.to}</td>
                <td>{b.busId?.departureTime ? formatDate(b.busId.departureTime) : "N/A"}</td>
                <td><strong>{b.seatNumber}</strong></td>
                <td>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </td>
                <td>
                  {b.status === "confirmed" && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyBookings;
