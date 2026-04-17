"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";

export default function VerificationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [bookingId, setBookingId] = useState("");
  const [otp, setOtp] = useState("");
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setBookingId(urlParams.get("bookingId") || "");
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.verifyBookingOtp(bookingId, otp);
      showToast("Booking Confirmed Successfully!", "success");
      router.push("/admin"); 
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Invalid Code", "error");
    }
  };

  return (
    <div className="main-container search-results-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
      <div className="glass-panel" style={{padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center'}}>
        <h2>Verify Booking</h2>
        <p className="text-muted" style={{marginBottom: '32px'}}>
          We have sent a 6-digit verification code to your email. Enter it below to confirm your booking and process payment.
        </p>

        <form onSubmit={handleVerify}>
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter 6-digit Code" 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              required
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Confirm & Pay
          </button>
        </form>
      </div>
    </div>
  );
}
