"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBusById, updateBusApi } from "../../utils/api";
import "../../../assets/css/admin.css";

const weekDays = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function EditBus() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBusById(id as string);

        const stops = data.routeStops || [];

        setForm({
          busName: data.busName,
          busNumber: data.busNumber,
          source: stops[0],
          destination: stops[stops.length - 1],
          intermediateStops: stops.slice(1, -1).join(", "),
          departureTime: data.departureTime,
          arrivalTime: data.arrivalTime,
          totalSeats: data.totalSeats,
          basePrice: data.basePrice,
          scheduleType: data.scheduleType,
          daysOfWeek: data.daysOfWeek || [],
          specificDates: data.specificDates || [],
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDaySelect = (day: string) => {
    let updated = [...form.daysOfWeek];

    if (updated.includes(day)) {
      updated = updated.filter((d) => d !== day);
    } else {
      updated.push(day);
    }

    setForm({ ...form, daysOfWeek: updated });
  };

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

  async function handleSubmit()  {
    try {
      setError("");

      const routeStops = [
        form.source,
        ...(form.intermediateStops
          ? form.intermediateStops.split(",").map((s: string) => s.trim())
          : []),
        form.destination,
      ];

      await updateBusApi(id as string, {
        ...form,
        routeStops,
      });

      router.push("/admin/buses");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="add-bus">
      <h2>Edit Bus</h2>

      {error && <p className="error">{error}</p>}

      {/* BASIC */}
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
      <h3 className="section-title">Route</h3>

      <div className="grid-3">
        <input name="source" value={form.source} onChange={handleChange} placeholder="Source" />
        <input name="intermediateStops" value={form.intermediateStops} onChange={handleChange} placeholder="Stops" />
        <input name="destination" value={form.destination} onChange={handleChange} placeholder="Destination" />
      </div>

      {/* TIME */}
      <h3 className="section-title">Timing</h3>

      <div className="grid-2">
        <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} />
        <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} />
      </div>

      {/* PRICING */}
      <h3 className="section-title">Pricing</h3>

      <div className="grid-2">
        <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange} />
        <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} />
      </div>

      {/* SCHEDULE */}
      <h3 className="section-title">Schedule</h3>

      <select name="scheduleType" value={form.scheduleType} onChange={handleChange}>
        <option value="Daily">Daily</option>
        <option value="SpecificDays">Specific Days</option>
        <option value="SpecificDates">Specific Dates</option>
      </select>

      {form.scheduleType === "SpecificDays" && (
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
      )}

      {form.scheduleType === "SpecificDates" && (
        <div>
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

      <button onClick={handleSubmit}>Update Bus</button>
    </div>
  );
}