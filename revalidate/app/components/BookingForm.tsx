"use client";

import { useState } from "react";
import SeatLayout from "./SeatLayout";
import { bookSeat } from "../utils/api";
import ErrorMessage from "./ErrorMessage";

export default function BookingForm({
  bus,
  date,
}: {
  bus: any;
  date: string;
}) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [startStop, setStartStop] = useState("");
  const [endStop, setEndStop] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBooking = async () => {
    // Validation
    if (!name || !email || !phone) {
      setError("Please fill in your name, email, and phone");
      setSuccess("");
      return;
    }
    if (!startStop || !endStop) {
      setError("Please select start and end stops");
      setSuccess("");
      return;
    }
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      setSuccess("");
      return;
    }
    if (bus.routeStops.indexOf(endStop) <= bus.routeStops.indexOf(startStop)) {
      setError("End stop must come after start stop");
      setSuccess("");
      return;
    }

    try {
      // Book each seat separately
      for (const seatNumber of selectedSeats) {
        await bookSeat({
          name,
          email,
          phone,
          busId: bus._id,
          startStop,
          endStop,
          seatNumber,
          travelDate: date,
        });
      }

      setSuccess("Booking successful!");
      setError("");
      setSelectedSeats([]);
      setStartStop("");
      setEndStop("");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      setError(err.message || "Booking failed");
      setSuccess("");
    }
  };

  return (
    <div>
      <ErrorMessage message={error} />
      {success && <div className="success-box">{success}</div>}

      <div className="user-details">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="stops-selection">
        <select value={startStop} onChange={(e) => setStartStop(e.target.value)}>
          <option value="">Start Stop</option>
          {bus?.routeStops.map((stop: string) => (
            <option key={stop} value={stop}>{stop}</option>
          ))}
        </select>

        <select value={endStop} onChange={(e) => setEndStop(e.target.value)}>
          <option value="">End Stop</option>
          {bus?.routeStops.map((stop: string) => (
            <option
              key={stop}
              value={stop}
              disabled={startStop && bus.routeStops.indexOf(stop) <= bus.routeStops.indexOf(startStop)}
            >
              {stop}
            </option>
          ))}
        </select>
      </div>

      <SeatLayout
        seats={bus?.totalSeats}
        selected={selectedSeats}
        setSelected={setSelectedSeats}
      />

      <p>Selected Seats: {selectedSeats.join(", ") || "-"}</p>
      <p>Price: {bus?.basePrice * selectedSeats.length || 0}</p>

      <button onClick={handleBooking}>Confirm Booking</button>
    </div>
  );
}