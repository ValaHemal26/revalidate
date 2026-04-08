"use client";
import { useState, useEffect, use } from "react";
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

    let userEmail = user.userEmail;
    function maskEmail(email) {
        const [prefix, domain] = email.split('@');
        const visible = prefix.slice(0, 2);
        const masked = '*'.repeat(prefix.length - 2);
        return visible + masked + '@' + domain;
    }
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
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
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
            router.push("/track-ticket/dashboard");
        } else {
            setError(res.message);
        }
    }

    async function ResendOtp() {
        setTimer(60);
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
        <div className="track-ticket-box">
            <LoaderModal show={loading} message={LoadingMessage} />
            <ErrorMessage message={error} /> 

            <h2>Enter OTP</h2>
            {userEmail && 
                <p>
                    OTP is sent to your register Email: <b> {maskEmail(userEmail)}</b>
                </p>
            }

            <div className="otpContainer">
                {otp.map((digit, i) => (
                <input
                    key={i}
                    id={"otp-" + i}
                    maxLength={1}  
                    className="otpInput"
                    onChange={(e) => handleChange(e.target.value, i)}
                />
                ))}
            </div>

            <button className="verifyOtp" onClick={verifyOtp}>
                Verify
            </button>

            <p className="timer">
                {timer > 0 ? "Resend in OTP " + timer + "s" : 
                <button className="resendOtp" onClick={ResendOtp}>
                    Resend Otp
                </button>}
            </p>
        </div>
        </>
    );
}