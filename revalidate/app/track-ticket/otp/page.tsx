"use client";
import { useState, useEffect } from "react";
import  "../../assets/css/style.css";
import Cookies from "js-cookie";
import { verifyTicketOtp,setSendTicketOTP } from "../../utils/api";
import { LoaderModal } from "../../components/LoaderModal";
import  ErrorMessage  from "../../components/ErrorMessage";
import { useRouter } from "next/navigation";


export default function OTP() {

    const router = useRouter();
    const [loading,setLoading] = useState(false);
    const [LoadingMessage,setLoadingMessage] = useState("");
    const [error,setError] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const raw = Cookies.get("trackUser");
    const user = raw ? JSON.parse(raw) : null;

    useEffect(() => {
        const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    function handleChange  (value, index)  {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
        }
    }
 
    async function verifyOtp() {
        
        const finalOtp = otp.join("");
        setLoadingMessage("varifying your OTP please do not close window");
        setLoading(true)
        const res = await verifyTicketOtp(user,finalOtp);
        setLoading(false);
        if (res.success) {
        Cookies.set("userToken", res.accessToken, {
            expires: new Date(new Date().getTime() + 5 * 60 * 1000),
            path: "/track-ticket",
        });
        Cookies.set("userRefreshToken", res.refreshToken, {
            expires: 7,
            path: "/track-ticket",
        });
        Cookies.set("bookings", JSON.stringify(res.bookings), {
            expires: 7,
            path: "/track-ticket",
        });
            router.push("/track-ticket/dashboard");
        } else {
        setError(res.message);
        }
    }

    async function ResendOtp() {
        
            setLoadingMessage("Resending OTP...");
            setLoading(true);

            const res = await setSendTicketOTP("email", user.userEmail);

            setLoading(false);
            setLoadingMessage("");

            if (res?.success) {
                setError("Otp send to your mail Please check and varify");
            } else {
                setError(res.message);
            }
    }
    return (
        <>
        <LoaderModal show={loading} message={LoadingMessage} />
        <ErrorMessage message={error} /> 
        <h2>Enter OTP</h2>

        <div className="otpContainer">
            {otp.map((digit, i) => (
            <input
                key={i}
                id={`otp-${i}`}
                maxLength="1"
                className="otpInput"
                onChange={(e) => handleChange(e.target.value, i)}
            />
            ))}
        </div>

        <button className="button" onClick={verifyOtp}>
            Verify
        </button>

        <p className="timer">
            {timer > 0 ? `Resend in ${timer}s` : 
            <button className="button" onClick={ResendOtp}>
                Resend Otp
            </button>}
        </p>
        </>
    );
}