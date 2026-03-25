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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  function normalize  (val: string) {
    return val?.toString().trim().toLowerCase();
  }

  const startIndex = bus.routeStops.findIndex(
    (stop: string) => normalize(stop) === normalize(startStop)
  );

  const endIndex = bus.routeStops.findIndex(
    (stop: string) => normalize(stop) === normalize(endStop)
  );

  const totalStops = Math.max(bus.routeStops.length - 1, 1);
  const segmentDistance =
    startIndex >= 0 && endIndex >= 0
      ? Math.abs(endIndex - startIndex)
      : 0;
  
  const basePrice = Number(bus.basePrice) || 0;

  const price =
    startIndex >= 0 &&
    endIndex >= 0 &&
    startIndex !== endIndex
      ? Math.round((segmentDistance / totalStops) * basePrice)
      : 0;

  const totalPrice = price * selectedSeats.length;
  
  function handleBookingSummary() {
    if (!name || !email || !phone) {
      return setError("Fill all user details");
    }

    if (selectedSeats.length === 0) {
      return setError("Select seats");
    }

    setError("");
    setShowSummary(true);
  }

  async function handleConfirmBooking ()  {
    if (!name || !email || !phone) {
      return setError("Fill all user details");
    }

    if (!startStop || !endStop || !date) {
      return setError("Invalid route or date");
    }

    if (selectedSeats.length === 0) {
      return setError("Select seats");
    }

    try {
      for (const seatNumber of selectedSeats) {
        const res = await bookSeat({
          name,
          email,
          phone,
          busId: bus._id,
          startStop,
          endStop,
          seatNumber,
          date,
        });
       
        if (!res.success) {
          setError(res.data.message || "Booking failed");
          setSuccess("");
          return;
        }
      }
      setSuccess("Booking successful!");
      setError("");
      
    } catch (err: any) {
      setError(err.Error)
    }
  };

  return (
    <div>
      <ErrorMessage message={error} />

      {success && <div className="success-box">{success}</div>}
      
       {showSummary ? (
        <div className="summary-box">
          <h3>Booking Summary</h3>

          <p><strong>Name:</strong> {name}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>

          <p>
            <strong>Route:</strong> {startStop} → {endStop}
          </p>
          <p><strong>Date:</strong> {date}</p>

          <p><strong>Seats:</strong> {selectedSeats.join(", ")}</p>
          <p><strong>Price per seat:</strong> {price}</p>
          <p><strong>Total Price:</strong> {totalPrice}</p>

          <button onClick={handleConfirmBooking}>
            Confirm Booking
          </button>

          <button onClick={() => setShowSummary(false)}>
            Back
          </button>
          {otpSent && !otpVerified && (
            <div>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}
        </div>
      ) : (
        <>
         
          <div className="route-box">
            <p>
              <strong>{startStop}</strong> → <strong>{endStop}</strong>
            </p>
            <span>{date}</span>
          </div>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <SeatLayout
            seats={bus.totalSeats}
            selected={selectedSeats}
            setSelected={setSelectedSeats}
          />

          <p>Seats: {selectedSeats.join(", ") || "-"}</p>
          <p>Price per seat: {price}</p>
          <p>Total: {totalPrice}</p>

          <button onClick={handleBookingSummary}>
            Next
          </button>
        </>
      )}
    </div>
  );
}