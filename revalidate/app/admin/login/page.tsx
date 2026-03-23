"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "../../admin/utils/api";
import Cookies from "js-cookie";
import "../../assets/css/admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const res = await adminLogin(email, password);
      Cookies.set("admin", JSON.stringify(res.admin));
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}