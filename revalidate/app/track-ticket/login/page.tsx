"use client";
import { useState } from "react";
import {setSendTicketOTP} from "../../utils/api";
import {useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ErrorMessage from "../../components/ErrorMessage";
import {LoaderModal} from "../../components/LoaderModal";

export default function Login() {
  const [type, setType] = useState("email");
  const [value, setValue] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [loadingMessage,setLoadingMessage] = useState("");
  
  const router = useRouter();
  async function sendOtp() {
        if (type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
            setError("Please enter a valid email address");
            return;
            }
        }

        if (type === "phone") {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value)) {
            setError("Please enter a valid 10-digit phone number");
            return;
            }
        }
        setLoadingMessage("Otp is sent to your email which you enter while booking");
        setLoading(true);

        const res = await setSendTicketOTP(type, value);

        setLoading(false);
        setLoadingMessage("");

        if (res?.success) {
        
            Cookies.set(
                "trackUser",
                JSON.stringify({ type, value,userEmail:res?.email }),
                { expires: 1 } 
            );

            router.push("/track-ticket/otp");
        } else {
            setError(res.message);
        }
    }   

  return (
    <>
    <LoaderModal show={loading} message={loadingMessage} />
    <ErrorMessage message={error} /> 
        
      <h2>Track Your Ticket</h2>

      <select
        onChange={(e) => setType(e.target.value)}
        className="select"
      >
        <option value="email">Email</option>
        <option value="phone">Phone</option>
      </select>

      <input
        className="input"
        placeholder={`Enter ${type}`}
        onChange={(e) => setValue(e.target.value)}
      />

      <button className="button" onClick={sendOtp}>
        Send OTP
      </button>

      <div className="guide">
        <h4>How it works:</h4>
        <ul>
          <li>Select Email or Phone</li>
          <li>Enter your registered details</li>
          <li>Receive OTP on your email</li>
          <li>Verify OTP to view your booking</li>
        </ul>
      </div>
    </>
  );
}