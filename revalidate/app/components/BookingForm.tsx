"use client";

import { useState } from "react";
import SeatLayout from "./SeatLayout";
import { bookSeat } from "../utils/api";
import ErrorMessage from "./ErrorMessage";

export default function BookingForm({
  bus,
  date,
  source,
  destination,
}: any) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [startStop] = useState(source);
  const [endStop] = useState(destination);
  const [travelDate, setTravelDate] = useState(date);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startIndex = bus.routeStops.indexOf(startStop);
  const endIndex = bus.routeStops.indexOf(endStop);

  const totalStops = bus.routeStops.length - 1;
  const segmentDistance = endIndex - startIndex;

  const price =
    startIndex >= 0 && endIndex > startIndex
      ? Math.round((segmentDistance / totalStops) * bus.basePrice)
      : 0;

  const totalPrice = price * selectedSeats.length;

  const handleBooking = async () => {
    if (!name || !email || !phone) {
      return setError("Fill all user details");
    }

    if (!startStop || !endStop || !travelDate) {
      return setError("Invalid route or date");
    }

    if (selectedSeats.length === 0) {
      return setError("Select seats");
    }

    try {
      for (const seatNumber of selectedSeats) {
        await bookSeat({
          name,
          email,
          phone,
          busId: bus._id,
          startStop,
          endStop,
          seatNumber,
          travelDate,
        });
      }

      setSuccess("Booking successful!");
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <ErrorMessage message={error} />
      {success && <div className="success-box">{success}</div>}

      <div className="route-box">
        <p>
          <strong>{startStop}</strong> → <strong>{endStop}</strong>
        </p>
      </div>

   
      <input
        type="date"
        value={travelDate}
        onChange={(e) => setTravelDate(e.target.value)}
      />

    
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

   
      <SeatLayout
        seats={bus.totalSeats}
        selected={selectedSeats}
        setSelected={setSelectedSeats}
      />

      <p>Seats: {selectedSeats.join(", ") || "-"}</p>
      <p>Price per seat: {price}</p>
      <p>Total: {totalPrice}</p>

      <button onClick={handleBooking}>Confirm Booking</button>
    </div>
  );
}