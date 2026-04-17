import React, { useState, useRef, useEffect } from "react";
import { searchCities, fetchAllCities } from "../utils/api";

interface CityAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

export default function CityAutocomplete({ value, onChange, placeholder }: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch all cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await fetchAllCities();
        setAllCities(cities);
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    };
    loadCities();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);

    if (val.trim() === "") {
      setFilteredCities(allCities);
      return;
    }

    setLoading(true);
    try {
      const results = await searchCities(val);
      setFilteredCities(results);
    } catch (err) {
      console.error("Search failed:", err);
      // Fallback to local filtering
      const localResults = allCities.filter((city) =>
        city.name?.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredCities(localResults);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city: any) => {
    onChange(city.name || city);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setFilteredCities(allCities);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        required
        autoComplete="off"
      />
      {isOpen && filteredCities.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-md)",
          maxHeight: "250px",
          overflowY: "auto",
          zIndex: 1000,
          listStyle: "none",
          padding: "8px 0",
          marginTop: "4px"
        }}>
          {loading ? (
            <li style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-secondary)" }}>
              Loading...
            </li>
          ) : (
            filteredCities.map((city, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(city)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {city.name || city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
