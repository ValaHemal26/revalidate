"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";
import { api } from "../../api/api";

export default function SeatLayoutPicker({ params }: { params: { busId: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [bus, setBus] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  
  // Passenger Info Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);

  // Read query params from URL via window.location (since this is client component)
  const [searchParams, setSearchParams] = useState({ source: "", destination: "", date: "" });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qToken = urlParams.get("q");
    if (qToken) {
      try {
        const decoded = JSON.parse(Buffer.from(qToken, 'base64').toString('utf8'));
        setSearchParams({
          source: decoded.source || "",
          destination: decoded.destination || "",
          date: decoded.date || ""
        });
      } catch (err) {}
    }
    fetchBusDetails();
  }, []);

  const fetchBusDetails = async () => {
    try {
      const data = await api.getBusById(params.busId);
      setBus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      showToast("Please select a seat in the grid.", "error");
      return;
    }

    try {
      const data = await api.lockSeat({
        name, email, phone,
        busId: params.busId,
        startStop: searchParams.source,
        endStop: searchParams.destination,
        seatNumber: selectedSeat,
        date: searchParams.date
      });

      showToast("Seat Locked. Check email for verify code.", "success");
      // Navigate to verification flow
      router.push(`/verify?bookingId=${data.bookingId}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error locking seat", "error");
    }
  };

  if (loading) return <div className="main-container"><div className="loading-state">Loading actual seats...</div></div>;
  if (!bus) return <div className="main-container">Bus not found.</div>;

  const renderSeats = () => {
    const seats = [];
    for (let i = 1; i <= bus.totalSeats; i++) {
      const isSelected = selectedSeat === i;
      seats.push(
        <button
          key={i}
          type="button"
          className={`seat-btn ${isSelected ? "selected" : "available"}`}
          onClick={() => setSelectedSeat(i)}
        >
          {i}
        </button>
      );
    }
    return seats;
  };

  return (
    <div className="main-container search-results-page">
      <div className="search-layout">
        <div className="seat-grid-container glass-panel">
          <h3>Select your Seat</h3>
          <p className="text-muted">Currently viewing deck</p>
          <div className="seat-grid">
            {renderSeats()}
          </div>
        </div>

        <div className="booking-form-container glass-panel">
          <h3>Passenger Details</h3>
          <form className="booking-form" onSubmit={handleLockSeat}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Full Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Email ID (For OTP)</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: "32px" }}>
              <label>Phone Number</label>
              <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div className="price-summary">
              <span>Selected Seat: {selectedSeat || "-"}</span>
              <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '16px'}}>
                Proceed to Pay & Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
