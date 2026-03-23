"use client";

import { useEffect, useState } from "react";
import { fetchBookings, cancelBooking } from "../../admin/utils/api";
import "../../assets/css/admin.css";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");

  const loadBookings = () => {
    fetchBookings()
      .then(setBookings)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      loadBookings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Bookings</h2>
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Bus</th>
            <th>Passenger</th>
            <th>Seat</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.busId?.busName}</td>
              <td>{b.name}</td>
              <td>{b.seatNumber}</td>
              <td>{b.startStop}</td>
              <td>{b.endStop}</td>
              <td>{b.travelDate}</td>
              <td>₹{b.price}</td>
              <td>{b.status}</td>
              <td>{b.status === "Booked" && <button onClick={() => handleCancel(b._id)}>Cancel</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}