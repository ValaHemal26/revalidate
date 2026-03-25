"use client";

import { useEffect, useState } from "react";
import { searchBuses, fetchBuses } from "../utils/api";
import BusCard from "../components/BusCard";
import { LoaderModal } from "../components/LoaderModal";

export default function BusesPage() {
  const [allBuses, setAllBuses] = useState<any[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Load all buses only for stops list
  useEffect(() => {
    fetchBuses()
      .then((data) => setAllBuses(data))
      .catch((err: any) => setError(err.message));
  }, []);

  // ✅ Extract all stops
  const allStops: string[] = [];

  allBuses.forEach((bus) => {
    bus.routeStops.forEach((stop: string) => {
      if (!allStops.includes(stop)) {
        allStops.push(stop);
      }
    });
  });

  // ✅ Date restrictions
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // ✅ Search handler
  async function handleSearch() {
    if (!source || !destination || !date) {
      return setError("All fields required");
    }

    setError("");
    setLoading(true);
    setLoadingMessage("🔍 Searching buses for your route...");

    const start = Date.now();

    const res = await searchBuses(source, destination, date);

    const elapsed = Date.now() - start;
    if (elapsed < 1000) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    setLoading(false);

    if (!res.success) {
      return setError(res.data.message || "Search failed");
    }

    setFilteredBuses(res.data);
    setHasSearched(true);
  }

  return (
    <div className="search-box">
      <LoaderModal show={loading} message={loadingMessage} />

      <h2>Search Buses</h2>

      {error && <p className="error">{error}</p>}

      {/* ✅ Source Input */}
      <input
        list="source-stops"
        placeholder="Source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <datalist id="source-stops">
        {allStops.map((stop, i) => (
          <option key={i} value={stop} />
        ))}
      </datalist>

      {/* ✅ Destination Input */}
      <input
        list="destination-stops"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <datalist id="destination-stops">
        {allStops.map((stop, i) => (
          <option key={i} value={stop} />
        ))}
      </datalist>

      {/* ✅ Date Input with restriction */}
      <input
        type="date"
        value={date}
        min={formatDate(today)}
        max={formatDate(maxDate)}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={handleSearch} disabled={loading}>
        Search
      </button>

      {/* ✅ Route Summary */}
      {hasSearched && (
        <div className="summary">
          🧭 {source} → {destination} | 📅 {date}
        </div>
      )}

      {/* ✅ Results */}
      {!loading && hasSearched && (
        <BusCard
          bus={filteredBuses}
          date={date}
          destination={destination}
          source={source}
        />
      )}
    </div>
  );
}