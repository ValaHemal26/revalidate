"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../../components/Sidebar";
import BusRouteForm from "../../components/BusRouteForm";
import { addBus } from "../../admin/utils/api";
import "../../assets/css/admin-modern.css";

const BUS_TYPES = ["Seater", "AC", "Non-AC", "Sleeper"];
const SCHEDULE_TYPES = ["Daily", "SpecificDays", "SpecificDates"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AMENITIES = ["WiFi", "Charging", "AC", "Food", "Blanket", "Pillow"];

interface RouteStop {
  cityId: string;
  cityName: string;
  pickupPoints: any[];
  dropPoints: any[];
  isDestination?: boolean;
}

export default function AddBus() {
  const router = useRouter();
  const token = Cookies.get("token");
  const [formData, setFormData] = useState({ busName: "", busNumber: "", busType: "Seater", amenities: [] as string[], departureTime: "06:00", arrivalTime: "18:00", totalSeats: 40, basePrice: 500, scheduleType: "Daily", daysOfWeek: [] as string[], specificDates: [] as string[] });
  const [route, setRoute] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { if (!token) router.push("/admin/login"); }, [token, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "totalSeats" || name === "basePrice" ? Number(value) : value }));
    if (error) setError(null);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity] }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({ ...prev, daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter(d => d !== day) : [...prev.daysOfWeek, day] }));
  };

  const handleDateAdd = (date: string) => {
    if (date && !formData.specificDates.includes(date)) {
      setFormData(prev => ({ ...prev, specificDates: [...prev.specificDates, date] }));
    }
  };

  const handleDateRemove = (date: string) => {
    setFormData(prev => ({ ...prev, specificDates: prev.specificDates.filter(d => d !== date) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.busName.trim()) { setError("Bus name is required"); return; }
    if (!formData.busNumber.trim()) { setError("Bus number is required"); return; }
    if (formData.totalSeats < 10 || formData.totalSeats > 100) { setError("Total seats must be between 10 and 100"); return; }
    if (formData.basePrice < 100) { setError("Base price must be at least ₹100"); return; }
    if (route.length < 2) { setError("Please select at least source and destination cities"); return; }
    if (formData.scheduleType === "SpecificDays" && formData.daysOfWeek.length === 0) { setError("Please select at least one day"); return; }
    if (formData.scheduleType === "SpecificDates" && formData.specificDates.length === 0) { setError("Please add at least one specific date"); return; }

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
      const busPayload = {
        ...formData,
        routeStops: route.map((r) => r.cityName),
        route: apiRoute,
        isActive: true,
      };
      await addBus(busPayload, token);
      setSuccess("Bus added successfully!");
      setTimeout(() => { router.push("/admin/buses"); }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole="ADMIN" userName="Admin" />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Add New Bus</h1>
            <p className="header-subtitle">Create a new bus service for your fleet</p>
          </div>
        </div>
        <div className="dashboard-content">
          {error && <div className="error-message"><span>⚠️</span><span>{error}</span></div>}
          {success && <div className="success-message"><span>✓</span><span>{success}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>🚌 Basic Information</h3></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bus Name *</label>
                    <input type="text" name="busName" className="form-control" value={formData.busName} onChange={handleInputChange} placeholder="e.g., Shree Travels Express" required />
                  </div>
                  <div className="form-group">
                    <label>Bus Number *</label>
                    <input type="text" name="busNumber" className="form-control" value={formData.busNumber} onChange={handleInputChange} placeholder="e.g., GJ-6R-5000" required />
                  </div>
                  <div className="form-group">
                    <label>Bus Type *</label>
                    <select name="busType" className="form-control" value={formData.busType} onChange={handleInputChange}>
                      {BUS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
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
                    <input type="number" name="totalSeats" className="form-control" value={formData.totalSeats} onChange={handleInputChange} min="10" max="100" required />
                    <small style={{ color: "var(--text-secondary)" }}>Between 10-100 seats</small>
                  </div>
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input type="number" name="basePrice" className="form-control" value={formData.basePrice} onChange={handleInputChange} min="100" required />
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
                    <input type="time" name="departureTime" className="form-control" value={formData.departureTime} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time *</label>
                    <input type="time" name="arrivalTime" className="form-control" value={formData.arrivalTime} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>✨ Amenities</h3></div>
              <div className="card-body">
                <div className="checkbox-group">
                  {AMENITIES.map(amenity => (
                    <div key={amenity} className="form-group-checkbox">
                      <input type="checkbox" id={`amenity-${amenity}`} checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} />
                      <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>🗺️ Routes & Cities</h3></div>
              <div className="card-body">
                <BusRouteForm onRouteChange={setRoute} showDescription={true} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header"><h3>📅 Schedule Type</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Schedule Type *</label>
                  <select name="scheduleType" className="form-control" value={formData.scheduleType} onChange={handleInputChange}>
                    {SCHEDULE_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type === "Daily" ? "Daily Service" : type === "SpecificDays" ? "Specific Days Only" : "Specific Dates Only"}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.scheduleType === "SpecificDays" && (
                  <div className="form-group">
                    <label>Select Days of Week *</label>
                    <div className="checkbox-group">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="form-group-checkbox">
                          <input type="checkbox" id={`day-${day}`} checked={formData.daysOfWeek.includes(day)} onChange={() => handleDayToggle(day)} />
                          <label htmlFor={`day-${day}`}>{day.slice(0, 3)}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.scheduleType === "SpecificDates" && (
                  <div className="form-group">
                    <label>Specific Dates *</label>
                    <input type="date" className="form-control" onChange={e => handleDateAdd(e.target.value)} />
                    <div className="tag-list">
                      {formData.specificDates.map(date => (
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
                  <span>Adding Bus...</span>
                </> : "✓ Add Bus"}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
// // "use client";
// // import React, { useState, useEffect } from "react";
// // import { useRouter } from "next/navigation";
// // import Cookies from "js-cookie";
// // import Sidebar from "../../components/Sidebar";
// // import BusRouteForm from "../../components/BusRouteForm";
// // import { addBus } from "../../admin/utils/api";
// // import "../../assets/css/admin-modern.css";

// // const BUS_TYPES = ["Seater", "AC", "Non-AC", "Sleeper"];
// // const SCHEDULE_TYPES = ["Daily", "SpecificDays", "SpecificDates"];
// // const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// // const AMENITIES = ["WiFi", "Charging", "AC", "Food", "Blanket", "Pillow"];

// // interface RouteStop {
// //   cityId: string;
// //   cityName: string;
// //   pickupPoints: any[];
// //   dropPoints: any[];
// //   isDestination?: boolean;
// // }

// // export default function AddBus() {
// //   const router = useRouter();
// //   const token = Cookies.get("token");

// //   const [formData, setFormData] = useState({
// //     busName: "",
// //     busNumber: "",
// //     busType: "Seater",
// //     amenities: [] as string[],
// //     departureTime: "06:00",
// //     arrivalTime: "18:00",
// //     totalSeats: 40,
// //     basePrice: 500,
// //     scheduleType: "Daily",
// //     daysOfWeek: [] as string[],
// //     specificDates: [] as string[],
// //   });

// //   const [route, setRoute] = useState<RouteStop[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [success, setSuccess] = useState<string | null>(null);

// //   useEffect(() => {
// //     if (!token) {
// //       router.push("/admin/login");
// //     }
// //   }, [token, router]);

// //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: name === "totalSeats" || name === "basePrice" ? Number(value) : value,
// //     }));
// //     if (error) setError(null);
// //   };

// //   const handleAmenityToggle = (amenity: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       amenities: prev.amenities.includes(amenity)
// //         ? prev.amenities.filter((a) => a !== amenity)
// //         : [...prev.amenities, amenity],
// //     }));
// //   };

// //   const handleDayToggle = (day: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       daysOfWeek: prev.daysOfWeek.includes(day)
// //         ? prev.daysOfWeek.filter((d) => d !== day)
// //         : [...prev.daysOfWeek, day],
// //     }));
// //   };

// //   const handleDateAdd = (date: string) => {
// //     if (date && !formData.specificDates.includes(date)) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         specificDates: [...prev.specificDates, date],
// //       }));
// //     }
// //   };

// //   const handleDateRemove = (date: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       specificDates: prev.specificDates.filter((d) => d !== date),
// //     }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setError(null);
// //     setSuccess(null);

// //     // Validation
// //     if (!formData.busName.trim()) {
// //       setError("Bus name is required");
// //       return;
// //     }
// //     if (!formData.busNumber.trim()) {
// //       setError("Bus number is required");
// //       return;
// //     }
// //     if (formData.totalSeats < 10 || formData.totalSeats > 100) {
// //       setError("Total seats must be between 10 and 100");
// //       return;
// //     }
// //     if (formData.basePrice < 100) {
// //       setError("Base price must be at least ₹100");
// //       return;
// //     }
// //     if (route.length < 2) {
// //       setError("Please select at least source and destination cities");
// //       return;
// //     }
// //     if (formData.scheduleType === "SpecificDays" && formData.daysOfWeek.length === 0) {
// //       setError("Please select at least one day for the specific days schedule");
// //       return;
// //     }
// //     if (formData.scheduleType === "SpecificDates" && formData.specificDates.length === 0) {
// //       setError("Please add at least one specific date");
// //       return;
// //     }

// //     try {
// //       setLoading(true);

// //       const busPayload = {
// //         ...formData,
// //         routeStops: route.map((r) => r.cityName),
// //         route,
// //         isActive: true,
// //       };

// //       await addBus(busPayload, token);
// //       setSuccess("Bus added successfully!");
// //       setTimeout(() => {
// //         router.push("/admin/buses");
// //       }, 1500);
// //     } catch (err: any) {
// //       setError(err.message || "Failed to add bus");
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="dashboard-container">
// //       <Sidebar userRole="ADMIN" userName="Admin" />

// //       <div className="dashboard-main">
// //         {/* Header */}
// //         <div className="dashboard-header">
// //           <div className="header-left">
// //             <h1 className="header-title">Add New Bus</h1>
// //             <p className="header-subtitle">Create a new bus service for your fleet</p>
// //           </div>
// //         </div>

// //         {/* Content */}
// //         <div className="dashboard-content">
// //           {error && (
// //             <div className="error-message">
// //               <span>⚠️</span>
// //               <span>{error}</span>
// //             </div>
// //           )}
// //           {success && (
// //             <div className="success-message">
// //               <span>✓</span>
// //               <span>{success}</span>
// //             </div>
// //           )}

// //           <form onSubmit={handleSubmit}>
// //             {/* Basic Information */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>🚌 Basic Information</h3>
// //               </div>
// //               <div className="card-body">
// //                 <div className="form-row">
// //                   <div className="form-group">
// //                     <label>Bus Name *</label>
// //                     <input
// //                       type="text"
// //                       name="busName"
// //                       className="form-control"
// //                       value={formData.busName}
// //                       onChange={handleInputChange}
// //                       placeholder="e.g., Shree Travels Express"
// //                       required
// //                     />
// //                   </div>

// //                   <div className="form-group">
// //                     <label>Bus Number *</label>
// //                     <input
// //                       type="text"
// //                       name="busNumber"
// //                       className="form-control"
// //                       value={formData.busNumber}
// //                       onChange={handleInputChange}
// //                       placeholder="e.g., GJ-6R-5000"
// //                       required
// //                     />
// //                   </div>

// //                   <div className="form-group">
// //                     <label>Bus Type *</label>
// //                     <select
// //                       name="busType"
// //                       className="form-control"
// //                       value={formData.busType}
// //                       onChange={handleInputChange}
// //                     >
// //                       {BUS_TYPES.map((type) => (
// //                         <option key={type} value={type}>
// //                           {type}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Capacity & Pricing */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>💺 Capacity & Pricing</h3>
// //               </div>
// //               <div className="card-body">
// //                 <div className="form-row">
// //                   <div className="form-group">
// //                     <label>Total Seats *</label>
// //                     <input
// //                       type="number"
// //                       name="totalSeats"
// //                       className="form-control"
// //                       value={formData.totalSeats}
// //                       onChange={handleInputChange}
// //                       min="10"
// //                       max="100"
// //                       required
// //                     />
// //                     <small style={{ color: "var(--text-secondary)" }}>Between 10-100 seats</small>
// //                   </div>

// //                   <div className="form-group">
// //                     <label>Base Price (₹) *</label>
// //                     <input
// //                       type="number"
// //                       name="basePrice"
// //                       className="form-control"
// //                       value={formData.basePrice}
// //                       onChange={handleInputChange}
// //                       min="100"
// //                       required
// //                     />
// //                     <small style={{ color: "var(--text-secondary)" }}>Minimum ₹100</small>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Time Schedule */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>🕐 Time Schedule</h3>
// //               </div>
// //               <div className="card-body">
// //                 <div className="form-row">
// //                   <div className="form-group">
// //                     <label>Departure Time *</label>
// //                     <input
// //                       type="time"
// //                       name="departureTime"
// //                       className="form-control"
// //                       value={formData.departureTime}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </div>

// //                   <div className="form-group">
// //                     <label>Arrival Time *</label>
// //                     <input
// //                       type="time"
// //                       name="arrivalTime"
// //                       className="form-control"
// //                       value={formData.arrivalTime}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Amenities */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>✨ Amenities</h3>
// //               </div>
// //               <div className="card-body">
// //                 <div className="checkbox-group">
// //                   {AMENITIES.map((amenity) => (
// //                     <div key={amenity} className="form-group-checkbox">
// //                       <input
// //                         type="checkbox"
// //                         id={`amenity-${amenity}`}
// //                         checked={formData.amenities.includes(amenity)}
// //                         onChange={() => handleAmenityToggle(amenity)}
// //                       />
// //                       <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Routes & Cities */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>🗺️ Routes & Cities</h3>
// //               </div>
// //               <div className="card-body">
// //                 <BusRouteForm
// //                   onRouteChange={setRoute}
// //                   showDescription={true}
// //                 />
// //               </div>
// //             </div>

// //             {/* Schedule Type */}
// //             <div className="card" style={{ marginBottom: "20px" }}>
// //               <div className="card-header">
// //                 <h3>📅 Schedule Type</h3>
// //               </div>
// //               <div className="card-body">
// //                 <div className="form-group">
// //                   <label>Schedule Type *</label>
// //                   <select
// //                     name="scheduleType"
// //                     className="form-control"
// //                     value={formData.scheduleType}
// //                     onChange={handleInputChange}
// //                   >
// //                     {SCHEDULE_TYPES.map((type) => (
// //                       <option key={type} value={type}>
// //                         {type === "Daily"
// //                           ? "Daily Service"
// //                           : type === "SpecificDays"
// //                           ? "Specific Days Only"
// //                           : "Specific Dates Only"}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 {/* Specific Days */}
// //                 {formData.scheduleType === "SpecificDays" && (
// //                   <div className="form-group">
// //                     <label>Select Days of Week *</label>
// //                     <div className="checkbox-group">
// //                       {DAYS_OF_WEEK.map((day) => (
// //                         <div key={day} className="form-group-checkbox">
// //                           <input
// //                             type="checkbox"
// //                             id={`day-${day}`}
// //                             checked={formData.daysOfWeek.includes(day)}
// //                             onChange={() => handleDayToggle(day)}
// //                           />
// //                           <label htmlFor={`day-${day}`}>{day.slice(0, 3)}</label>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* Specific Dates */}
// //                 {formData.scheduleType === "SpecificDates" && (
// //                   <div className="form-group">
// //                     <label>Specific Dates *</label>
// //                     <input
// //                       type="date"
// //                       className="form-control"
// //                       onChange={(e) => handleDateAdd(e.target.value)}
// //                     />
// //                     <div className="tag-list">
// //                       {formData.specificDates.map((date) => (
// //                         <div key={date} className="tag">
// //                           {new Date(date).toLocaleDateString("en-IN")}
// //                           <button
// //                             type="button"
// //                             onClick={() => handleDateRemove(date)}
// //                           >
// //                             ×
// //                           </button>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Form Actions */}
// //             <div className="card">
// //               <div className="card-footer">
// //                 <button
// //                   type="button"
// //                   onClick={() => router.back()}
// //                   className="btn btn-secondary"
// //                   disabled={loading}
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="btn btn-primary"
// //                   disabled={loading}
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <span className="loader"></span>
// //                       <span>Adding Bus...</span>
// //                     </>
// //                   ) : (
// //                     "✓ Add Bus"
// //                   )}
// //                 </button>
// //               </div>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
  