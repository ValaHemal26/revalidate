"use client";

import { useEffect, useState } from "react";
import { fetchBuses, deleteBus } from "../../admin/utils/api";
import Link from "next/link";
import "../../assets/css/admin.css";
import { GetAuthCookie } from "../utils/Functions";

export default function ManageBuses() {
  const [buses, setBuses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const token = GetAuthCookie();

  const loadBuses = () => {
    fetchBuses(token)
      .then(setBuses)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { loadBuses(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete this bus?")) return;
    try {
      await deleteBus(id,token);
      loadBuses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Manage Buses</h2>
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Stops</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Seats</th>
            <th>Base Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus._id}>
              <td>{bus.busName}</td>
              <td>{bus.busNumber}</td>
              <td>{bus.routeStops.join(", ")}</td>
              <td>{bus.departureTime}</td>
              <td>{bus.arrivalTime}</td>
              <td>{bus.totalSeats}</td>
              <td>₹{bus.basePrice}</td>
              <td>
                <Link href={`/admin/buses/${bus._id}`}><button>Edit</button></Link>
                <button onClick={() => handleDelete(bus._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}