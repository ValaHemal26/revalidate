"use client";

import { useEffect, useState } from "react";
import { fetchBuses } from "../utils/api";
import { useRouter } from "next/navigation";
import BusCard from "../components/BusCard";

export default function BusesPage() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [filteredSources, setFilteredSources] = useState<string[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);

  useEffect(() => {
    fetchBuses()
      .then((data) =>{  setBuses(data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

 async function handleSearch ()  {
  try {
    if (!source || !destination || !date) {
      setError("All fields are required");
      return;
    }

    setError("");
    setLoading(true);

    const data = await fetchBuses({ source, destination, date });

    setBuses(data); 

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    if (source) {
      const matches = buses
        .flatMap((b) => b.routeStops)
        .filter((stop, idx, arr) => arr.indexOf(stop) === idx)
        .filter((stop) => stop.toLowerCase().includes(source.toLowerCase()));
      setFilteredSources(matches.length ? matches : ["No source found"]);
      
    } else {
      setFilteredSources([]);
    }
  }, [source, buses]);

  // Autocomplete for destination
  useEffect(() => {
    if (destination) {
      const matches = buses
        .flatMap((b) => b.routeStops)
        .filter((stop, idx, arr) => arr.indexOf(stop) === idx)
        .filter((stop) => stop.toLowerCase().includes(destination.toLowerCase()));
      setFilteredDestinations(matches.length ? matches : ["No destination found"]);
    } else {
      setFilteredDestinations([]);
    }
  }, [destination, buses]);
  console.log(buses);
  return (
    <div className="search-box">
      <h2>Search Buses</h2>
      {error && <div className="error-box">{error}</div>}

      <div style={{ position: "relative" }}>
        <input
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        {filteredSources.length > 0 && (
          <ul className="autocomplete-list">
            {filteredSources.map((item, i) => (
              <li key={i} onClick={() =>  {
                  if (item !== "No source found") {
                    setSource(item);
                    setFilteredSources([]); 
                  }
                }}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <input
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        {filteredDestinations.length > 0 && (
          <ul className="autocomplete-list">
            {filteredDestinations.map((item, i) => (
              <li key={i} onClick={() =>  {
                  if (item !== "No source found") {
                    setDestination(item);
                    setFilteredDestinations([]); 
                  }
                }}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={handleSearch}>Search Buses</button>

      {loading && <p>Loading buses...</p>}
      {
        !loading && buses &&
        <BusCard bus={buses} date={date} />
      }
    </div>
  );
}