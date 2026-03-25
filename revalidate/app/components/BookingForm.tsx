"use client";

import { useState } from "react";
import  ErrorMessage  from "../components/ErrorMessage";
import  {LoaderModal}  from "../components/LoaderModal";
import  SeatLayout  from "../components/SeatLayout";
import { sendOtp, verifyOtp, bookSeat } from "../utils/api";


export default function BookingForm({
  bus,
  date,
  source,
  destination,
}: any) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startStop] = useState(source); 
  const [endStop] = useState(destination);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSummary, setShowSummary] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  function normalize (val: string) { return val?.toString().trim().toLowerCase(); } 
  const startIndex = bus.routeStops.findIndex( (stop: string) => normalize(stop) === normalize(startStop) ); 
  const endIndex = bus.routeStops.findIndex( (stop: string) => normalize(stop) === normalize(endStop) );
  const totalStops = Math.max(bus.routeStops.length - 1, 1); const segmentDistance = startIndex >= 0 && endIndex >= 0 ? Math.abs(endIndex - startIndex) : 0; const basePrice = Number(bus.basePrice) || 0; const price = startIndex >= 0 && endIndex >= 0 && startIndex !== endIndex ? Math.round((segmentDistance / totalStops) * basePrice) : 0;
  const totalPrice = price * selectedSeats.length;
 async function handleBookingSummary() {
    if (!name || !email || !phone) {
      return setError("Fill all details");
    }

    if (selectedSeats.length === 0) {
      return setError("Select seats");
    }

    setLoading(true);
    setLoadingMessage("Sending OTP to your email...");

    const res = await sendOtp(email, {
      name,
      source,
      destination,
      date,
      seats: selectedSeats,
      totalPrice,
    });

    setLoading(false);

    if (!res.success) {
      return setError(res.data.message || "Failed to send OTP");
    }

    setOtpSent(true);
    setShowSummary(true);
  }
  // ✅ VERIFY OTP
  async function handleVerifyOtp() {
    if (!otp) return setError("Enter OTP");

    setLoading(true);

    const res = await verifyOtp(email, otp);

    setLoading(false);

    if (!res.success) {
      return setError(res.data.message || "Invalid OTP");
    }

    setOtpVerified(true);
    setError("");
    setSuccess("OTP Verified ✅");
  }

  // ✅ BOOK TICKET
  async function handleConfirmBooking() {
    if (!otpVerified) {
      return setError("Verify OTP first");
    }

    setLoading(true);

    try {
      for (const seatNumber of selectedSeats) {
        const res = await bookSeat({
          name,
          email,
          phone,
          busId: bus._id,
          startStop: source,
          endStop: destination,
          seatNumber,
          date,
        });

        if (!res.success) {
          setLoading(false);
          return setError(res.data.message || "Booking failed");
        }
      }

      setSuccess("Booking successful 🎉");
      setError("");
    } catch (err: any) {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div>
      <LoaderModal show={loading} message={loadingMessage} />

      <ErrorMessage message={error} />
      {success && <div className="success-box">{success}</div>}

      {showSummary ? (
        <div className="summary-box">
          <h3>Summary</h3>

          <p>{name}</p>
          <p>{email}</p>
          <p>{phone}</p>
          <p>{source} → {destination}</p>

          <p>Seats: {selectedSeats.join(", ")}</p>
          <p>Total: {totalPrice}</p>

          {otpSent && !otpVerified && (
            <div>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button type="button" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={!otpVerified}
          >
            Confirm Booking
          </button>

          <button onClick={() => setShowSummary(false)}>
            Back
          </button>
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
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone"
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