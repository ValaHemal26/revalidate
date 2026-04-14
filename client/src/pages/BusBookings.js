// ============================
// Bus Bookings Page (Operator)
// ============================
// Shows all bookings for a specific bus.

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBusBookings } from "../services/api";

function BusBookings() {
  const { busId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBusBookings(busId);
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [busId]);

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div>
      <h1 className="page-title">Bus Bookings</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span>📋</span>
          <p>No bookings for this bus yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Email</th>
              <th>Seat</th>
              <th>Status</th>
              <th>Booked On</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.userId?.name}</td>
                <td>{b.userId?.email}</td>
                <td><strong>{b.seatNumber}</strong></td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BusBookings;
