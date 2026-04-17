"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";

interface City {
  _id: string;
  name: string;
  state: string;
}

interface Point {
  _id: string;
  name: string;
  fullName?: string;
}

interface CityPointSelectorProps {
  onCitiesChange: (cities: City[]) => void;
  onPointsChange: (selectedPoints: { [cityId: string]: Point[] }) => void;
  isOperatorPanel?: boolean;
  showDescription?: boolean;
}

export default function CityPointSelector({
  onCitiesChange,
  onPointsChange,
  isOperatorPanel = false,
  showDescription = true,
}: CityPointSelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [pointsByCity, setPointsByCity] = useState<{ [key: string]: Point[] }>({});
  const [selectedPoints, setSelectedPoints] = useState<{ [key: string]: Point[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cities
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/v1/locations/cities"
      );
      if (!response.ok) throw new Error("Failed to fetch cities");
      const data = await response.json();
      setCities(data);
      setError(null);
    } catch (err) {
      setError("Failed to load cities. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch points for a city
  const fetchPointsForCity = async (cityId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/locations/cities/${cityId}/points`
      );
      if (!response.ok) throw new Error("Failed to fetch points");
      const data = await response.json();
      setPointsByCity((prev) => ({
        ...prev,
        [cityId]: data,
      }));
    } catch (err) {
      console.error("Failed to fetch points for city:", err);
    }
  };

  const handleCityChange = (newSelectedCities: City[] | null) => {
    const citiesArray = newSelectedCities || [];
    setSelectedCities(citiesArray);
    onCitiesChange(citiesArray);

    // Fetch points for newly selected cities
    citiesArray.forEach((city) => {
      if (!pointsByCity[city._id]) {
        fetchPointsForCity(city._id);
      }
    });

    // Reset points for deselected cities
    const selectedCityIds = citiesArray.map((c) => c._id);
    const updatedSelectedPoints: { [key: string]: Point[] } = {};
    Object.keys(selectedPoints).forEach((cityId) => {
      if (selectedCityIds.includes(cityId)) {
        updatedSelectedPoints[cityId] = selectedPoints[cityId];
      }
    });
    setSelectedPoints(updatedSelectedPoints);
    onPointsChange(updatedSelectedPoints);
  };

  const handlePointsChange = (cityId: string, points: Point[] | null) => {
    const updatedPoints = { ...selectedPoints };
    if (points && points.length > 0) {
      updatedPoints[cityId] = points;
    } else {
      delete updatedPoints[cityId];
    }
    setSelectedPoints(updatedPoints);
    onPointsChange(updatedPoints);
  };

  const cityOptions = cities.map((city) => ({
    value: city._id,
    label: `${city.name} (${city.state})`,
    ...city,
  }));

  return (
    <div className="city-points-selector">
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label">
          Select Cities {isOperatorPanel ? "(For Routes)" : ""}
        </label>
        {showDescription && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Choose one or more cities where you operate bus services.
          </p>
        )}
        <Select
          isMulti
          isDisabled={loading}
          options={cityOptions}
          value={selectedCities.map((city) => ({
            value: city._id,
            label: `${city.name} (${city.state})`,
            ...city,
          }))}
          onChange={(newValue: any) => {
            handleCityChange(newValue ? newValue.map((v: any) => ({
              _id: v._id,
              name: v.name,
              state: v.state,
            })) : null);
          }}
          classNamePrefix="react-select"
          isSearchable
          isClearable
          placeholder={loading ? "Loading cities..." : "Search and select cities..."}
        />
      </div>

      {selectedCities.length > 0 && (
        <div className="points-section">
          <h3 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>
            Select Pickup & Drop Points by City
          </h3>

          {selectedCities.map((city) => (
            <div
              key={city._id}
              className="city-points-group card"
              style={{ marginBottom: "16px" }}
            >
              <div className="card-header">
                <h4 style={{ fontSize: "14px", fontWeight: "600" }}>
                  {city.name}
                </h4>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {pointsByCity[city._id]?.length || 0} points available
                </span>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label className="form-label">
                  {isOperatorPanel ? "Route Points" : "Available Points"}
                </label>
                <Select
                  isMulti
                  options={(pointsByCity[city._id] || []).map((point) => ({
                    value: point._id,
                    label: point.fullName || point.name,
                    ...point,
                  }))}
                  value={(selectedPoints[city._id] || []).map((point) => ({
                    value: point._id,
                    label: point.fullName || point.name,
                    ...point,
                  }))}
                  onChange={(newValue: any) => {
                    handlePointsChange(
                      city._id,
                      newValue
                        ? newValue.map((v: any) => ({
                            _id: v._id,
                            name: v.name,
                            fullName: v.fullName,
                          }))
                        : null
                    );
                  }}
                  classNamePrefix="react-select"
                  isSearchable
                  isClearable
                  placeholder="Select points..."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .city-points-selector {
          width: 100%;
        }

        .points-section {
          margin-top: 20px;
        }

        .city-points-group {
          border-left: 3px solid var(--primary-color);
        }

        @media (max-width: 768px) {
          .city-points-group {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
