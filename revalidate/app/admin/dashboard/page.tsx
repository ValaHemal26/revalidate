"use client";

import { useEffect, useState } from "react";
import { fetchDashboard } from "../../admin/utils/api";
import Link from "next/link";
import "../../assets/css/admin.css";
import { GetAuthCookie } from "../utils/Functions";


export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [error, setError] = useState("");
  const token = GetAuthCookie();
  useEffect(() => {
    fetchDashboard({token})
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="card">
          <h3>Total Buses</h3>
          <p>{stats.totalBuses || 0}</p>
        </div>
        <div className="card">
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings || 0}</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p>₹{stats.revenue || 0}</p>
        </div>
        <div className="card">
          <h3>Today Bookings</h3>
          <p>{stats.todayBookings || 0}</p>
        </div>
      </div>
      <div className="admin-navigate">
        <Link href="/admin/add-bus">
          <button className="add-bus-btn">Add New Bus</button>
        </Link>
        <Link href="/admin/buses">
          <button className="add-bus-btn" >Manage Buses</button>
        </Link>
        <Link href="/admin/bookings">
          <button className="add-bus-btn" >View Bookings</button>
        </Link>
      </div>
    </div>
  );
}