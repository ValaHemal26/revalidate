// ============================
// Book Bus Page (Seat Selection)
// ============================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBus, createBooking } from "../services/api";

function BookBus() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch bus details and booked seats
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await getBus(busId);
        setBus(res.data.bus);
        setBookedSeats(res.data.bookedSeats);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load bus details." });
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [busId]);

  // Handle seat click
  const handleSeatClick = (seatNum) => {
    if (bookedSeats.includes(seatNum)) return; // Can't select booked seats
    setSelectedSeat(seatNum === selectedSeat ? null : seatNum);
  };

  // Book the selected seat
  const handleBook = async () => {
    if (!selectedSeat) return;
    setBooking(true);
    setMessage({ type: "", text: "" });

    try {
      await createBooking({ busId, seatNumber: selectedSeat });
      setMessage({ type: "success", text: `Seat ${selectedSeat} booked successfully!` });
      // Redirect to bookings after 2 seconds
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Booking failed." });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading">Loading bus details...</div>;
  if (!bus) return <div className="empty-state"><span>❌</span><p>Bus not found.</p></div>;

  const formatDate = (d) => new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <h1 className="page-title">Book a Seat</h1>

      {/* Bus Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ color: "var(--color-primary)", marginBottom: 8 }}>{bus.busName}</h2>
        <div className="bus-route">
          <strong>{bus.from}</strong> <span className="arrow">→</span> <strong>{bus.to}</strong>
        </div>
        <div className="bus-time">🕐 {formatDate(bus.departureTime)} — {formatDate(bus.arrivalTime)}</div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: "var(--color-secondary)" }}>₹{bus.price} per seat</div>
      </div>

      {/* Seat Legend */}
      <div className="seat-legend">
        <span><div className="legend-box available"></div> Available</span>
        <span><div className="legend-box selected"></div> Selected</span>
        <span><div className="legend-box booked"></div> Booked</span>
      </div>

      {/* Seat Grid */}
      <div className="seat-grid">
        {Array.from({ length: bus.totalSeats }, (_, i) => i + 1).map((seatNum) => (
          <div
            key={seatNum}
            className={`seat ${bookedSeats.includes(seatNum) ? "booked" : ""} ${selectedSeat === seatNum ? "selected" : ""}`}
            onClick={() => handleSeatClick(seatNum)}
          >
            {seatNum}
          </div>
        ))}
      </div>

      {/* Booking Action */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        {selectedSeat && (
          <p style={{ marginBottom: 12 }}>
            Selected: <strong>Seat {selectedSeat}</strong> — ₹{bus.price}
          </p>
        )}
        {message.text && (
          <div className={`notification ${message.type}`} style={{ position: "static", marginBottom: 16 }}>
            {message.text}
          </div>
        )}
        <button className="btn btn-primary" onClick={handleBook} disabled={!selectedSeat || booking}>
          {booking ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

export default BookBus;
