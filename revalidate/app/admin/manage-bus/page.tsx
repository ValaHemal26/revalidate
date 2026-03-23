"use client";
import { useEffect, useState } from "react";
import "../../assets/css/admin.css";
import { useRouter } from "next/navigation";

export default function ManageBus() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBuses = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/buses", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("❌ Unauthorized. Please login as admin.");
          return;
        } else {
          setError("❌ Failed to fetch buses");
          return;
        }
      }

      const data = await res.json();

          if (!Array.isArray(data)) {
        setError("❌ Invalid data format received from server");
        return;
      }

      setBuses(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("❌ Something went wrong while fetching buses");
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/bus/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        alert("❌ Failed to delete bus");
        return;
      }

      fetchBuses();
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    }
  };

  useEffect(() => {
    fetchBuses();
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
                onClick={() => deleteBus(bus._id)}
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