"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../api/api";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qToken = searchParams.get("q");
    if (qToken) {
      try {
        const decoded = JSON.parse(Buffer.from(qToken, 'base64').toString('utf8'));
        setSource(decoded.source || "");
        setDestination(decoded.destination || "");
        setDate(decoded.date || "");
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (source && destination && date) {
      fetchBuses();
    }
  }, [source, destination, date]);

  const fetchBuses = async () => {
    try {
      const data = await api.searchBuses(source, destination, date);
      setBuses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container search-results-page">
      <div className="search-header glass-panel">
        <div>
          <h2>{source} → {destination}</h2>
          <p className="text-muted">{new Date(date).toDateString()}</p>
        </div>
        <button className="btn btn-secondary">Modify Search</button>
      </div>

      <div className="search-layout">
        <aside className="filters-sidebar glass-panel">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Bus Type</label>
            <div><input type="checkbox" /> AC</div>
            <div><input type="checkbox" /> Non-AC</div>
            <div><input type="checkbox" /> Sleeper</div>
            <div><input type="checkbox" /> Seater</div>
          </div>
        </aside>

        <div className="bus-list">
          {loading ? (
            <div className="loading-state">Finding best buses for you...</div>
          ) : buses.length === 0 ? (
            <div className="empty-state glass-panel">
              <h3>No buses found</h3>
              <p>Try modifying your search criteria or dates.</p>
            </div>
          ) : (
            buses.map((bus: any) => (
              <div key={bus._id} className="bus-card glass-panel">
                <div className="bus-info-top">
                  <h4>{bus.busName}</h4>
                  <span className={`bus-type-badge ${bus.busType.toLowerCase()}`}>{bus.busType}</span>
                </div>
                
                <div className="bus-timing-row">
                  <div className="time-col">
                    <strong>{bus.departureTime}</strong>
                    <span>{source}</span>
                  </div>
                  <div className="duration-line">
                    <span className="dot"></span>
                    <span className="line"></span>
                    <span className="dot"></span>
                  </div>
                  <div className="time-col">
                    <strong>{bus.arrivalTime}</strong>
                    <span>{destination}</span>
                  </div>
                </div>

                <div className="bus-footer">
                  <div className="price-info">
                    <span className="price">₹{bus.priceEst}</span>
                    <span className="seats-avail">{bus.availableSeats} seats left</span>
                  </div>
                  <button 
                    className="btn btn-primary"
                    disabled={bus.status !== "AVAILABLE"}
                    onClick={() => {
                      const payload = JSON.stringify({ source, destination, date });
                      const encodedToken = Buffer.from(payload).toString('base64');
                      window.location.href = `/book/${bus._id}?q=${encodedToken}`;
                    }}
                  >
                    {bus.status === "AVAILABLE" ? "View Seats" : "Sold Out"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
