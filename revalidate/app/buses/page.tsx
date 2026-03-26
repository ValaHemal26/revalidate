"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { searchBuses, fetchBuses } from "../utils/api";
import BusCard from "../components/BusCard";
import dynamic from "next/dynamic";
import { LoaderModal } from "../components/LoaderModal";

export default function BusesPage() {
  const [allBuses, setAllBuses] = useState<any[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  const [source, setSource] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [date, setDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [destInputValue, setDestInputValue] = useState("");

  const [hasSearched, setHasSearched] = useState(false);
  const Select = dynamic(() => import('react-select'), {
    ssr: false,
  });
  useEffect(() => {
    fetchBuses()
      .then((data) => setAllBuses(data))
      .catch((err: any) => setError(err.message));
  }, []);

  const stopSet = new Set<string>();

  allBuses.forEach((bus) => {
    stopSet.add(bus.name);
  });

  const stopOptions = Array.from(stopSet).map((stop) => ({
    value: stop,
    label: stop,
  }));

  const filteredOptions = stopOptions.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );
  const filteredDestOptions = stopOptions.filter((opt) =>
    opt.label.toLowerCase().includes(destInputValue.toLowerCase())
  );
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  async function handleSearch() {
    if (!source || !destination || !date) {
      return setError("All fields required");
    }

    if (source.value === destination.value) {
      return setError("Source and destination cannot be same");
    }

    setError("");
    setLoading(true);
    setLoadingMessage("🔍 Searching buses for your route...");

    const res = await searchBuses(
      source.value,
      destination.value,
      date
    );

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

      <Select
        options={inputValue ? filteredOptions : []}
        value={source}
        onChange={setSource}
        onInputChange={(val) => setInputValue(val)}
        placeholder="Type source..."
        isSearchable
        className="search-input"
      />

      <Select
        options={destInputValue ? filteredDestOptions : []}
        value={destination}
        onChange={setDestination}
        onInputChange={(val) => setDestInputValue(val)}
        placeholder="Type destination..."
        isSearchable
        className="search-input"
      />

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

      {/* ✅ Summary */}
      {hasSearched && source && destination && (
        <div className="summary">
          🧭 {source.label} → {destination.label} | 📅 {date}
        </div>
      )}

      {/* ✅ Results */}
      {!loading && hasSearched && (
        <BusCard
          bus={filteredBuses}
          date={date}
          destination={destination?.value}
          source={source?.value}
        />
      )}
    </div>
  );
}