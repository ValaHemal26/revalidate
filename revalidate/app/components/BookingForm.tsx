"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import { LoaderModal } from "../components/LoaderModal";
import SeatLayout from "../components/SeatLayout";
import { sendOtp, verifyOtp, bookSeat,checkSeatAvailability, getPaytmbus } from "../utils/api";

export default function BookingForm({ bus, date, source, destination }: any) {
  const [step, setStep] = useState(1);

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [contactDetails,setContactDetails] = useState({
    name:"",
    email:"",
    phone:"",
  })

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);

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
  useEffect(()=>{
    fetchSeats();
  },[])
  async function fetchSeats() {
    try {
      const res = await checkSeatAvailability(
        {
          busId: bus._id,
          startStop: source,
          endStop: destination,
        },
        date
      );

      setBookedSeats(Array.isArray(res.bookedSeats) ? res.bookedSeats : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendOtp() {
    if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
      return setError("Fill all details");
    }

    setLoading(true);
    setLoadingMessage("We've sent an OTP to your email. Please enter it to proceed.");

    try {
      const res = await sendOtp(contactDetails.email, {
        name: contactDetails.name,
        source,
        destination,
        date,
        seats: selectedSeats,
        totalPrice,
      });

      if (!res?.success) {
        return setError(res?.data?.message || "OTP failed");
      }

      setStep(4);
      setError("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {

    if (!otp) return setError("Please Enter OTP First");

    setLoading(true);
    setLoadingMessage("Verifying OTP...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const res = await verifyOtp(contactDetails.email, otp);

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
          name: contactDetails.name,
          email: contactDetails.email,
          phone: contactDetails.phone,
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

  function handleStepClick(stepId: number) {
    setError("");
    if(stepId === 0){
      return setStep(1);
    }

    if (stepId === 1) {
      if (!selectedSeats.length) {
        return setError("Please select at least one seat first");
      }
      return setStep(2);
    }

    if (stepId === 2) {
      if (!selectedSeats.length) {
        setStep(1);
        return setError("Please select seats first");
      }
      if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
        setStep(2);
        return setError("Please fill passenger details first");
      }
      return setStep(3);
    }

    if (stepId === 3) {
      if (!selectedSeats.length) {
        setStep(1);
        return setError("Please select seats first");
      }
      if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
        setStep(2);
        return setError("Please fill passenger details first");
      }
      setOtpVerified(false);
      handleSendOtp();
      return setStep(4);
    }

    if (stepId === 4) {
      if (!selectedSeats.length) {
        setStep(1);
        return setError("Please select seats first");
      }
      if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
        setStep(2);
        return setError("Please fill passenger details first");
      }
      if (!otpVerified) {
        setStep(4);
        return setError("Please verify OTP first");
      }
      return setStep(5);
    }
  }

  function handleBack() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }
  return (
    <div className="booking-form-container">
      <LoaderModal show={loading} message={loadingMessage} />
      <ErrorMessage message={error} />

      <div className="stepper">
        {["Select Seats", "Passenger Details", "Review Booking", "OTP Verification", "Confirmation"].map((s, i) => (
          <div key={i} className={step >= i + 1 ? "active " + i : ""} onClick={ () =>handleStepClick(i )}>
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
            bookedSeats={bookedSeats}
          />

          <p>Per Seat Price: {price}</p>
          <p>Selected Seat: {selectedSeats.join(",") || 0 }</p>
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
          <input placeholder="Name" value={contactDetails.name ? contactDetails.name : ""} onChange={(e) =>
            setContactDetails((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }/>
          <input placeholder="Email" value={contactDetails.email ? contactDetails.email : ""}  onChange={(e) =>
              setContactDetails((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            } />
          <input placeholder="Phone" value={contactDetails.phone ? contactDetails.phone : ""}   onChange={(e) =>
            setContactDetails((prev) => ({
              ...prev,
              phone: e.target.value,
            }))
          } />
          <div className="button-wrapper">
            <button onClick={handleBack}>Back</button>
            <button onClick={() =>{
              if (!contactDetails.name || !contactDetails.email || !contactDetails.phone) {
                return setError("Please fill passenger details first");
              }
              setStep(3);
            }}>Next</button>
           
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Summary</h3>
          <p>{contactDetails.name}</p>
          <p>{contactDetails.email}</p>
          <p>{contactDetails.phone}</p>
          <p>Seats: {selectedSeats.join(", ")}</p>
          <p>Total: {totalPrice}</p>
          <div className="button-wrapper">
             <button onClick={handleBack}>Back</button>
            <button onClick={() =>{
                handleSendOtp();
                }}>Proceed</button>
            
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="button-wrapper">
            <button onClick={handleVerifyOtp}>Verify OTP</button>

            <button disabled={!otpVerified} onClick={handleBooking}>
              Confirm Booking
            </button>
            <button onClick={handleBack}>Back</button>
          </div>
        </>
      )}

      {step === 5 && (
        <div className="success-box">
          <h2>{success}</h2>
          <p>{contactDetails.name}</p>
          <p>{contactDetails.email}</p>
          <p>{source} → {destination}</p>
          <p>Seats: {selectedSeats.join(", ")}</p>
        </div>
      )}
    </div>
  );
}