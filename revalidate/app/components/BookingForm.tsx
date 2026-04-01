"use client";

import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import { LoaderModal } from "../components/LoaderModal";
import SeatLayout from "../components/SeatLayout";
import { sendOtp, verifyOtp, bookSeat } from "../utils/api";

export default function BookingForm({ bus, date, source, destination }: any) {
  const [step, setStep] = useState(1);

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // PRICE LOGIC
  function normalize(val: string) {
    return val?.toString().trim().toLowerCase();
  }

  const startIndex = bus.routeStops.findIndex(
    (s: string) => normalize(s) === normalize(source)
  );

  const endIndex = bus.routeStops.findIndex(
    (s: string) => normalize(s) === normalize(destination)
  );

  const totalStops = Math.max(bus.routeStops.length - 1, 1);
  const segmentDistance =
    startIndex >= 0 && endIndex >= 0
      ? Math.abs(endIndex - startIndex)
      : 0;

  const basePrice = Number(bus.basePrice) || 0;

  const price =
    startIndex !== endIndex
      ? Math.round((segmentDistance / totalStops) * basePrice)
      : 0;

  const totalPrice = price * selectedSeats.length;

  // STEP 2 → SEND OTP
  async function handleSendOtp() {
    if (!name || !email || !phone) {
      return setError("Fill all details");
    }

    setLoading(true);
    setLoadingMessage("Sending OTP...");

    try {
      const res = await sendOtp(email, {
        name,
        source,
        destination,
        date,
        seats: selectedSeats,
        totalPrice,
      });

      if (!res?.success) {
        return setError(res?.data?.message || "OTP failed");
      }

      setStep(3);
      setError("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // STEP 4 → VERIFY OTP
  async function handleVerifyOtp() {
    if (!otp) return setError("Enter OTP");

    setLoading(true);
    setLoadingMessage("Verifying OTP...");

    try {
      const res = await verifyOtp(email, otp);

      if (!res?.success) {
        return setError(res?.data?.message || "Invalid OTP");
      }

      setOtpVerified(true);
      setError("");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking() {
    if (!otpVerified) return setError("Verify OTP first");

    setLoading(true);
    setLoadingMessage("Booking your seats...");

    try {
      for (const seat of selectedSeats) {
        const res = await bookSeat({
          name,
          email,
          phone,
          busId: bus._id,
          startStop: source,
          endStop: destination,
          seatNumber: seat,
          date,
        });

        if (!res?.success) {
          return setError(res?.data?.message || "Booking failed");
        }
      }

      setStep(5);
      setSuccess("Booking Successful 🎉");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="booking-form-container">
      <LoaderModal show={loading} message={loadingMessage} />
      <ErrorMessage message={error} />

   
      <div className="stepper">
        {["Seats", "Details", "Summary", "OTP", "Done"].map((s, i) => (
          <div key={i} className={step >= i + 1 ? "active" : ""}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <h3>{source} → {destination}</h3>
          <SeatLayout
            seats={bus.totalSeats}
            selected={selectedSeats}
            setSelected={setSelectedSeats}
          />

          <p>Total: {totalPrice}</p>

          <button
            onClick={() => {
              if (!selectedSeats.length) return setError("Please Select atleast one Seat to Book Ticket");
              setStep(2);
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />

          <button onClick={handleSendOtp}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Summary</h3>
          <p>{name}</p>
          <p>{email}</p>
          <p>{phone}</p>
          <p>Seats: {selectedSeats.join(", ")}</p>
          <p>Total: {totalPrice}</p>

          <button onClick={() => setStep(4)}>Proceed</button>
        </>
      )}

      {step === 4 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={handleVerifyOtp}>Verify OTP</button>

          <button disabled={!otpVerified} onClick={handleBooking}>
            Confirm Booking
          </button>
        </>
      )}

      {step === 5 && (
        <div className="success-box">
          <h2>{success}</h2>
          <p>{name}</p>
          <p>{email}</p>
          <p>{source} → {destination}</p>
          <p>Seats: {selectedSeats.join(", ")}</p>
        </div>
      )}
    </div>
  );
}