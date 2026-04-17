"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CityAutocomplete from "./components/CityAutocomplete";

export default function Home() {
  const router = useRouter();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination && date) {
      // Secure URL via Base64 encoding
      const payload = JSON.stringify({ source, destination, date });
      const encodedToken = Buffer.from(payload).toString('base64');
      router.push(`/search?q=${encodedToken}`);
    }
  };

  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Experience Premium Bus Travel</h1>
          <p>India's leading network of luxury buses. Book now and travel with peak comfort.</p>

          <div className="glass-panel search-box">
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label>From</label>
                <CityAutocomplete value={source} onChange={setSource} placeholder="Leaving from..." />
              </div>
              <div className="form-divider" />
              <div className="form-group">
                <label>To</label>
                <CityAutocomplete value={destination} onChange={setDestination} placeholder="Going to..." />
              </div>
              <div className="form-divider" />
              <div className="form-group">
                <label>Date of Journey</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary search-btn">
                Search Buses
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}