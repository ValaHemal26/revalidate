"use client";

import { useEffect, useState } from "react";
import { fetchBuses } from "../utils/api";
import BusCard from "../components/BusCard";

export default function BusesPage() {
  const [allBuses, setAllBuses] = useState<any[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  const [showSource, setShowSource] = useState(false);
  const [showDestination, setShowDestination] = useState(false);

  useEffect(() => {
    fetchBuses()
      .then((data) => setAllBuses(data))
      .catch((err: any) => setError(err.message));
  }, []);

  const allStops = Array.from(
    new Set(allBuses.flatMap((b) => b.routeStops))
  );

  const filteredSourceStops = allStops.filter((stop) =>
    stop.toLowerCase().includes(source.toLowerCase())
  );

  const filteredDestinationStops = allStops.filter((stop) =>
    stop.toLowerCase().includes(destination.toLowerCase())
  );

  function handleSearch() {
    if (!source || !destination || !date) {
      setError("All fields required");
      return;
    }

    setError("");
    setLoading(true);

    const result = allBuses.filter((bus) => {
      return (
        bus.routeStops.includes(source) &&
        bus.routeStops.includes(destination)
      );
    });

    setFilteredBuses(result);
    setHasSearched(true);
    setLoading(false);
  }

  return (
    <div className="search-box">
      <h2>Search Buses</h2>

      {error && <p className="error">{error}</p>}

      <div className="dropdown">
        <input
          placeholder="Source"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setShowSource(true);
          }}
          onFocus={() => setShowSource(true)}
        />

        {showSource && source && (
          <div className="dropdown-menu">
            {filteredSourceStops.length ? (
              filteredSourceStops.map((stop, i) => (
                <div
                  key={i}
                  className="item"
                  onClick={() => {
                    setSource(stop);
                    setShowSource(false);
                  }}
                >
                  {stop}
                </div>
              ))
            ) : (
              <div className="item">No result</div>
            )}
          </div>
        )}
      </div>

      <div className="dropdown">
        <input
          placeholder="Destination"
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setShowDestination(true);
          }}
          onFocus={() => setShowDestination(true)}
        />

        {showDestination && destination && (
          <div className="dropdown-menu">
            {filteredDestinationStops.length ? (
              filteredDestinationStops.map((stop, i) => (
                <div
                  key={i}
                  className="item"
                  onClick={() => {
                    setDestination(stop);
                    setShowDestination(false);
                  }}
                >
                  {stop}
                </div>
              ))
            ) : (
              <div className="item">No result</div>
            )}
          </div>
        )}
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      {hasSearched && (
        <div className="summary">
          {source} → {destination} | {date}
        </div>
      )}

      {loading && <p>Loading...</p>}

      {!loading && hasSearched && (
        <BusCard bus={filteredBuses} date={date} destination={destination} source={source}  />
      )}
    </div>
  );
}