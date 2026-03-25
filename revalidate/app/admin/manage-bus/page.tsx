"use client";
import { useEffect, useState } from "react";
import "../../assets/css/admin.css";
import { useRouter } from "next/navigation";
import { GetAuthCookie } from "../utils/Functions";
import { fetchBuses,deleteBus } from "../utils/api";

export default function ManageBus() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = GetAuthCookie();
  
  async function getBuses(token)  {
    try {
      const res = await fetchBuses(token);
      setBuses(res);
      setError("");
    } catch (err) {
      setError("Something went wrong while fetching buses");
    } finally {
      setLoading(false);
    }
  };

  async function handleDeleteBus  (id: string)  {
    try {
      const res = await deleteBus(id,token);
      getBuses(token);
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    }
  };

  useEffect(() => {
    getBuses(token);
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading buses...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2 className="admin-title">Manage Buses</h2>

        {buses.length === 0 && <p>No buses found</p>}

        {buses.map((bus) => (
          <div key={bus._id} className="bus-item">
            <div>
              {bus.name} | {bus.from} → {bus.to} | ₹{bus.price} | 🕒 {bus.departureTime} → {bus.arrivalTime} | 📅 {bus.journeyDate}
            </div>

            <div style={{ marginTop: "5px" }}>
              <button
                className="edit-btn"
                onClick={() => router.push(`/admin/buses/${bus._id}`)}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDeleteBus(bus._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}