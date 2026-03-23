"use client";

import { useState } from "react";
import { addBus } from "../../admin/utils/api";
import { useRouter } from "next/navigation";
import "../../assets/css/admin.css";

const weekDays = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function AddBus() {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    busName: "",
    busNumber: "",
    source: "",
    destination: "",
    intermediateStops: "",
    departureTime: "",
    arrivalTime: "",
    totalSeats: 40,
    basePrice: 500,
    scheduleType: "Daily",
    daysOfWeek: [],
    specificDates: [],
  });

  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Multi Day Select
  const handleDaySelect = (day: string) => {
    let updated = [...form.daysOfWeek];

    if (updated.includes(day)) {
      updated = updated.filter((d) => d !== day);
    } else {
      updated.push(day);
    }

    setForm({ ...form, daysOfWeek: updated });
  };

  // ✅ Multiple Date Picker
  const handleDateAdd = (e: any) => {
    const value = e.target.value;
    if (!value) return;

    if (!form.specificDates.includes(value)) {
      setForm({
        ...form,
        specificDates: [...form.specificDates, value],
      });
    }
  };

  const removeDate = (date: string) => {
    setForm({
      ...form,
      specificDates: form.specificDates.filter((d: string) => d !== date),
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");

      const routeStops = [
        form.source,
        ...(form.intermediateStops
          ? form.intermediateStops.split(",").map((s: string) => s.trim())
          : []),
        form.destination,
      ];

      const data = {
        ...form,
        routeStops,
      };

      await addBus(data);
      router.push("/admin/buses");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="add-bus">
      <h2>Add New Bus</h2>
      {error && <p className="error">{error}</p>}

      {/* BASIC INFO */}
      <div className="grid-2">
        <div className="form-group">
          <label>Bus Name</label>
          <input name="busName" value={form.busName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Bus Number</label>
          <input name="busNumber" value={form.busNumber} onChange={handleChange} />
        </div>
      </div>

      {/* ROUTE */}
      <h3 className="section-title">Route Details</h3>

      <div className="grid-3">
        <div className="form-group">
          <label>Source</label>
          <input name="source" value={form.source} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Stops</label>
          <input
            name="intermediateStops"
            placeholder="Nadiad, Vadodara"
            value={form.intermediateStops}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input name="destination" value={form.destination} onChange={handleChange} />
        </div>
      </div>

      {/* TIME */}
      <h3 className="section-title">Timing</h3>

      <div className="grid-2">
        <div className="form-group">
          <label>Departure Time</label>
          <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Arrival Time</label>
          <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} />
        </div>
      </div>

      {/* PRICING */}
      <h3 className="section-title">Pricing</h3>

      <div className="grid-2">
        <div className="form-group">
          <label>Total Seats</label>
          <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Base Price</label>
          <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} />
        </div>
      </div>

      {/* SCHEDULE */}
      <h3 className="section-title">Schedule</h3>

      <div className="form-group">
        <label>Schedule Type</label>
        <select name="scheduleType" value={form.scheduleType} onChange={handleChange}>
          <option value="Daily">Daily</option>
          <option value="SpecificDays">Specific Days</option>
          <option value="SpecificDates">Specific Dates</option>
        </select>
      </div>

      {/* MULTI DAY SELECT */}
      {form.scheduleType === "SpecificDays" && (
        <div className="form-group">
          <label>Select Days</label>
          <div className="day-grid">
            {weekDays.map((day) => (
              <span
                key={day}
                className={form.daysOfWeek.includes(day) ? "day active" : "day"}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* MULTIPLE DATE PICKER */}
      {form.scheduleType === "SpecificDates" && (
        <div className="form-group">
          <label>Select Dates</label>
          <input type="date" onChange={handleDateAdd} />

          <div className="date-list">
            {form.specificDates.map((d: string) => (
              <span key={d} onClick={() => removeDate(d)}>
                {d} ✕
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSubmit}>Add Bus</button>
    </div>
  );
}