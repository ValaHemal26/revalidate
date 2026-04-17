"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";
import { api } from "../api/api";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "verify">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendOtp(email);
      showToast("OTP sent to your email!", "success");
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Server error", "error");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.verifyOtp(email, otp);
      // Simple client side cookie/localStorage store
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Logged in successfully!", "success");
      if (data.user?.role === "ADMIN" || data.user?.role === "OPERATOR") {
         router.push("/admin");
      } else {
         router.push("/");
      }
    } catch (err: any) {
      showToast(err.message || "Error verifying OTP", "error");
    }
  };

  return (
    <div className="main-container search-results-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh'}}>
      <div className="glass-panel" style={{padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center'}}>
        <h2 style={{ marginBottom: "24px" }}>Sign In to ViteBus</h2>
        
        {step === "login" ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {/* Password input exists for pure visual layout parity with standard apps mostly bypassed by OTP flow right now */}
            <div className="form-group">
              <label>Password (Optional for OTP flow)</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{marginTop: "8px"}}>
              Request OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            <div className="form-group">
              <label>Enter Verification Code</label>
              <input type="text" className="input-field" style={{textAlign: "center", fontSize: "20px", letterSpacing: "4px"}} value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{marginTop: "8px"}}>
              Verify & Log In
            </button>
            <button type="button" className="btn" onClick={() => setStep("login")} style={{background: "var(--bg-tertiary)"}}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
