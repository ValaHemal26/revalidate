"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import BusRouteForm from "../../../components/BusRouteForm";
import { getBusById, updateBus } from "../../utils/api";
import "../../../assets/css/admin-modern.css";

interface RouteStop {
  cityId: string;
  cityName: string;
  pickupPoints: any[];
  dropPoints: any[];
  isDestination?: boolean;
}

interface BusFormState {
  busName: string;
  busNumber: string;
  busType: string;
  amenities: string[];
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  basePrice: number;
  scheduleType: string;
  daysOfWeek: string[];
  specificDates: string[];
  isActive: boolean;
}

export default function EditBus() {
  const { id } = useParams();
  const router = useRouter();
  const token = Cookies.get("token");

  const [form, setForm] = useState<BusFormState>({
    busName: "",
    busNumber: "",
    busType: "Seater",
    amenities: [],
    departureTime: "06:00",
    arrivalTime: "18:00",
    totalSeats: 40,
    basePrice: 500,
    scheduleType: "Daily",
    daysOfWeek: [],
    specificDates: [],
    isActive: true,
  });

  const [route, setRoute] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getBusById(id as string, token);

        setForm({
          busName: data.busName || "",
          busNumber: data.busNumber || "",
          busType: data.busType || "Seater",
          amenities: data.amenities || [],
          departureTime: data.departureTime || "06:00",
          arrivalTime: data.arrivalTime || "18:00",
          totalSeats: data.totalSeats || 40,
          basePrice: data.basePrice || 500,
          scheduleType: data.scheduleType || "Daily",
          daysOfWeek: data.daysOfWeek || [],
          specificDates: data.specificDates || [],
          isActive: data.isActive ?? true,
        });

        setRoute(Array.isArray(data.route) ? data.route : []);
      } catch (err: any) {
        setError(err.message || "Failed to load bus details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalSeats" || name === "basePrice" ? Number(value) : value,
    }));
    if (error) setError(null);
  };

  // const handleAmenityToggle = (amenity: string) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     amenities: prev.amenities.includes(amenity)
  //       ? prev.amenities.filter((a) => a !== amenity)
  //       : [...prev.amenities, amenity],
  //   }));
  // };

  // const handleDayToggle = (day: string) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     daysOfWeek: prev.daysOfWeek.includes(day)
  //       ? prev.daysOfWeek.filter((d) => d !== day)
  //       : [...prev.daysOfWeek, day],
  //   }));
  // };

  // const handleDateAdd = (dateStr: string) => {
  //   if (dateStr && !form.specificDates.includes(dateStr)) {
  //     setForm((prev) => ({
  //       ...prev,
  //       specificDates: [...prev.specificDates, dateStr],
  //     }));
  //   }
  // };

  const handleDateRemove = (date: string) => {
    setForm((prev) => ({
      ...prev,
      specificDates: prev.specificDates.filter((d) => d !== date),
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleDayToggle = (day: string) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleDateAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      specificDates: prev.specificDates.includes(value)
        ? prev.specificDates
        : [...prev.specificDates, value],
    }));
  };

  const removeDate = (date: string) => {
    setForm((prev) => ({
      ...prev,
      specificDates: prev.specificDates.filter((d) => d !== date),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.busName.trim()) { setError("Bus name is required"); return; }
    if (!form.busNumber.trim()) { setError("Bus number is required"); return; }
    if (form.totalSeats < 10 || form.totalSeats > 100) { setError("Total seats must be between 10 and 100"); return; }
    if (form.basePrice < 100) { setError("Base price must be at least ₹100"); return; }
    if (route.length < 2) { setError("Please select source and destination cities"); return; }
    if (form.scheduleType === "SpecificDays" && form.daysOfWeek.length === 0) { setError("Please select at least one day"); return; }
    if (form.scheduleType === "SpecificDates" && form.specificDates.length === 0) { setError("Please add at least one specific date"); return; }

    try {
      setLoading(true);
      const apiRoute = route.map((stop) => ({
        cityId: stop.cityId,
        cityName: stop.cityName,
        pickupPoints: (stop.pickupPoints || []).map((point) => ({
          pointId: point._id || point.pointId,
          name: point.name,
        })),
        dropPoints: (stop.dropPoints || []).map((point) => ({
          pointId: point._id || point.pointId,
          name: point.name,
        })),
        isDestination: stop.isDestination ?? false,
      }));
      await updateBus(id as string, {
        ...form,
        routeStops: route.map((r) => r.cityName),
        route: apiRoute,
      }, token);
      setSuccess("Bus updated successfully!");
      setTimeout(() => { router.push("/admin/buses"); }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update bus");
    } finally {
      setLoading(false);
    }
  };

  const AVAILABLE_AMENITIES = ["WiFi", "Charging", "AC", "Food", "Blanket", "Pillow"];
  const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar userRole="ADMIN" userName="Admin" />
        <div className="dashboard-main">
          <div className="dashboard-content" style={{ padding: "20px", textAlign: "center" }}>
            Loading bus details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Edit Bus</h1>
            <p className="header-subtitle">Update bus details, route and schedule</p>
          </div>
          <div className="header-right">
            <Link href="/admin/buses" className="btn btn-secondary">Back to Buses</Link>
          </div>
        </div>
        <div className="dashboard-content">
          {error && <div className="error-message"><span>⚠️</span><span>{error}</span></div>}
          {success && <div className="success-message"><span>✓</span><span>{success}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>🚌 Bus Details</h3></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bus Name *</label>
                    <input type="text" name="busName" className="form-control" value={form.busName} onChange={handleChange} placeholder="e.g., Shree Travels Express" required />
                  </div>
                  <div className="form-group">
                    <label>Bus Number *</label>
                    <input type="text" name="busNumber" className="form-control" value={form.busNumber} onChange={handleChange} placeholder="e.g., GJ-6R-5000" required />
                  </div>
                  <div className="form-group">
                    <label>Bus Type *</label>
                    <select name="busType" className="form-control" value={form.busType} onChange={handleChange}>
                      {["Seater", "AC", "Non-AC", "Sleeper"].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>💺 Capacity & Pricing</h3></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Total Seats *</label>
                    <input type="number" name="totalSeats" className="form-control" value={form.totalSeats} onChange={handleChange} min="10" max="100" required />
                    <small style={{ color: "var(--text-secondary)" }}>Between 10-100 seats</small>
                  </div>
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input type="number" name="basePrice" className="form-control" value={form.basePrice} onChange={handleChange} min="100" required />
                    <small style={{ color: "var(--text-secondary)" }}>Minimum ₹100</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>🕐 Time Schedule</h3></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Departure Time *</label>
                    <input type="time" name="departureTime" className="form-control" value={form.departureTime} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time *</label>
                    <input type="time" name="arrivalTime" className="form-control" value={form.arrivalTime} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>✨ Amenities</h3></div>
              <div className="card-body">
                <div className="checkbox-group">
                  {["WiFi", "Charging", "AC", "Food", "Blanket", "Pillow"].map(amenity => (
                    <div key={amenity} className="form-group-checkbox">
                      <input type="checkbox" id={`amenity-${amenity}`} checked={form.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} />
                      <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>🗺️ Routes & Cities</h3></div>
              <div className="card-body">
                <BusRouteForm onRouteChange={setRoute} initialRoute={route} showDescription={true} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>📅 Schedule Type</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Schedule Type *</label>
                  <select name="scheduleType" className="form-control" value={form.scheduleType} onChange={handleChange}>
                    <option value="Daily">Daily Service</option>
                    <option value="SpecificDays">Specific Days Only</option>
                    <option value="SpecificDates">Specific Dates Only</option>
                  </select>
                </div>

                {form.scheduleType === "SpecificDays" && (
                  <div className="form-group">
                    <label>Select Days of Week *</label>
                    <div className="checkbox-group">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                        <div key={day} className="form-group-checkbox">
                          <input type="checkbox" id={`day-${day}`} checked={form.daysOfWeek.includes(day)} onChange={() => handleDayToggle(day)} />
                          <label htmlFor={`day-${day}`}>{day.slice(0, 3)}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.scheduleType === "SpecificDates" && (
                  <div className="form-group">
                    <label>Specific Dates *</label>
                    <input type="date" className="form-control" onChange={e => handleDateAdd(e.target.value)} />
                    <div className="tag-list">
                      {form.specificDates.map(date => (
                        <div key={date} className="tag">
                          {new Date(date).toLocaleDateString("en-IN")}
                          <button type="button" onClick={() => handleDateRemove(date)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-footer">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <>
                  <span className="loader"></span>
                  <span>Updating...</span>
                </> : "✓ Update Bus"}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
