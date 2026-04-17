"use client";
import React, { useEffect, useState } from "react";
import { fetchCitiesWithPoints, fetchPointsByCity } from "../admin/utils/api";
import "../assets/css/admin-modern.css";

interface City {
  _id: string;
  name: string;
  state: string;
  points?: Point[];
}

interface Point {
  _id: string;
  name: string;
  fullName?: string;
  cityId?: string;
  pointId?: string;
}

interface RouteStop {
  cityId: string;
  cityName: string;
  pickupPoints: Point[];
  dropPoints: Point[];
  isDestination?: boolean;
}

interface BusRouteFormProps {
  onRouteChange: (route: RouteStop[]) => void;
  initialRoute?: RouteStop[];
  showDescription?: boolean;
}

export default function BusRouteForm({ onRouteChange, initialRoute = [], showDescription = false }: BusRouteFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [pointsByCity, setPointsByCity] = useState<{ [key: string]: Point[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sourceCity, setSourceCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [intermediateStops, setIntermediateStops] = useState<City[]>([]);

  const [sourcePickupPoints, setSourcePickupPoints] = useState<Point[]>([]);
  const [destinationDropPoints, setDestinationDropPoints] = useState<Point[]>([]);
  const [intermediatePoints, setIntermediatePoints] = useState<{ [key: string]: { pickup: Point[]; drop: Point[] } }>({});

  const [sourceSearch, setSourceSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [intermediateSearch, setIntermediateSearch] = useState("");
  const [routeInitialized, setRouteInitialized] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (cities.length > 0 && initialRoute.length > 0 && !routeInitialized) {
      initializeFromRoute(initialRoute);
    }
  }, [cities, initialRoute, routeInitialized]);

  const normalizePoint = (point: any): Point => ({
    _id: (point._id || point.pointId || point.pointId?._id || "")?.toString(),
    name: point.name || point.fullName || "",
    fullName: point.fullName,
    cityId: point.cityId,
    pointId: point.pointId ? point.pointId.toString() : undefined,
  });

  const loadCities = async () => {
    try {
      setLoading(true);
      const data = await fetchCitiesWithPoints();
      if (Array.isArray(data)) {
        setCities(data.map((city: any) => ({
          _id: city._id,
          name: city.name,
          state: city.state,
          points: city.points || [],
        })));
        const initialPoints: { [key: string]: Point[] } = {};
        data.forEach((city: any) => {
          if (Array.isArray(city.points) && city._id) {
            initialPoints[city._id] = city.points.map(normalizePoint);
          }
        });
        setPointsByCity(initialPoints);
      } else {
        setCities([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load cities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeFromRoute = async (route: RouteStop[]) => {
    const validRoute = route.filter((stop) => stop.cityId && stop.cityName);
    if (validRoute.length < 2) return;

    const source = validRoute[0];
    const destination = validRoute[validRoute.length - 1];
    const intermediate = validRoute.slice(1, -1);

    const sourceCity = cities.find((city) => city._id === source.cityId);
    const destinationCity = cities.find((city) => city._id === destination.cityId);

    if (sourceCity) {
      setSourceCity(sourceCity);
      setSourceSearch(sourceCity.name);
      await getPointsForCity(sourceCity._id);
      setSourcePickupPoints((source.pickupPoints || []).map(normalizePoint));
    }

    if (destinationCity) {
      setDestinationCity(destinationCity);
      setDestinationSearch(destinationCity.name);
      await getPointsForCity(destinationCity._id);
      setDestinationDropPoints((destination.dropPoints || []).map(normalizePoint));
    }

    if (intermediate.length > 0) {
      const stops: City[] = [];
      const pointState: { [key: string]: { pickup: Point[]; drop: Point[] } } = {};

      for (const item of intermediate) {
        const city = cities.find((cityItem) => cityItem._id === item.cityId);
        if (!city) continue;
        stops.push(city);
        await getPointsForCity(city._id);
        pointState[city._id] = {
          pickup: (item.pickupPoints || []).map(normalizePoint),
          drop: (item.dropPoints || []).map(normalizePoint),
        };
      }

      setIntermediateStops(stops);
      setIntermediatePoints(pointState);
    }

    setRouteInitialized(true);
    updateRoute();
  };

  const getPointsForCity = async (cityId: string) => {
    try {
      if (!pointsByCity[cityId]) {
        const points = await fetchPointsByCity(cityId);
        setPointsByCity((prev) => ({
          ...prev,
          [cityId]: Array.isArray(points) ? points.map(normalizePoint) : [],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectSourceCity = async (city: City) => {
    setSourceCity(city);
    setSourceSearch(city.name);
    await getPointsForCity(city._id);
    setSourcePickupPoints([]);
    updateRoute();
  };

  const selectDestinationCity = async (city: City) => {
    setDestinationCity(city);
    setDestinationSearch(city.name);
    await getPointsForCity(city._id);
    setDestinationDropPoints([]);
    updateRoute();
  };

  const handleSourcePointChange = (pointId: string) => {
    if (!sourceCity) return;
    const points = pointsByCity[sourceCity._id] || [];
    const point = points.find((item) => item._id === pointId);
    if (!point) return;

    setSourcePickupPoints((prev) =>
      prev.some((p) => p._id === pointId) ? prev.filter((p) => p._id !== pointId) : [...prev, point],
    );
    updateRoute();
  };

  const handleDestinationPointChange = (pointId: string) => {
    if (!destinationCity) return;
    const points = pointsByCity[destinationCity._id] || [];
    const point = points.find((item) => item._id === pointId);
    if (!point) return;

    setDestinationDropPoints((prev) =>
      prev.some((p) => p._id === pointId) ? prev.filter((p) => p._id !== pointId) : [...prev, point],
    );
    updateRoute();
  };

  const addIntermediateStop = async (cityId: string) => {
    const city = cities.find((c) => c._id === cityId);
    if (!city) return;
    if (intermediateStops.some((c) => c._id === cityId)) return;

    setIntermediateStops((prev) => [...prev, city]);
    await getPointsForCity(cityId);
    updateRoute();
  };

  const removeIntermediateStop = (cityId: string) => {
    setIntermediateStops((prev) => prev.filter((c) => c._id !== cityId));
    setIntermediatePoints((prev) => {
      const updated = { ...prev };
      delete updated[cityId];
      return updated;
    });
    updateRoute();
  };

  const handleIntermediatePointChange = (cityId: string, pointId: string, type: "pickup" | "drop") => {
    const points = pointsByCity[cityId] || [];
    const point = points.find((item) => item._id === pointId);
    if (!point) return;

    setIntermediatePoints((prev) => {
      const current = prev[cityId] || { pickup: [], drop: [] };
      const updated = type === "pickup"
        ? {
            ...current,
            pickup: current.pickup.some((p) => p._id === pointId)
              ? current.pickup.filter((p) => p._id !== pointId)
              : [...current.pickup, point],
          }
        : {
            ...current,
            drop: current.drop.some((p) => p._id === pointId)
              ? current.drop.filter((p) => p._id !== pointId)
              : [...current.drop, point],
          };
      return { ...prev, [cityId]: updated };
    });
    updateRoute();
  };

  const updateRoute = () => {
    const route: RouteStop[] = [];

    if (sourceCity) {
      route.push({
        cityId: sourceCity._id,
        cityName: sourceCity.name,
        pickupPoints: sourcePickupPoints,
        dropPoints: [],
        isDestination: false,
      });
    }

    intermediateStops.forEach((city) => {
      const points = intermediatePoints[city._id] || { pickup: [], drop: [] };
      route.push({
        cityId: city._id,
        cityName: city.name,
        pickupPoints: points.pickup,
        dropPoints: points.drop,
        isDestination: false,
      });
    });

    if (destinationCity) {
      route.push({
        cityId: destinationCity._id,
        cityName: destinationCity.name,
        pickupPoints: [],
        dropPoints: destinationDropPoints,
        isDestination: true,
      });
    }

    onRouteChange(route);
  };

  const filteredSourceCities = cities.filter((city) =>
    city.name.toLowerCase().includes(sourceSearch.toLowerCase()) && city._id !== destinationCity?._id,
  );

  const filteredDestinationCities = cities.filter((city) =>
    city.name.toLowerCase().includes(destinationSearch.toLowerCase()) && city._id !== sourceCity?._id,
  );

  const filteredIntermediateCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(intermediateSearch.toLowerCase()) &&
      city._id !== sourceCity?._id &&
      city._id !== destinationCity?._id &&
      !intermediateStops.some((stop) => stop._id === city._id),
  );

  const availableCitiesForIntermediate = cities.filter(
    (c) =>
      c._id !== sourceCity?._id &&
      c._id !== destinationCity?._id &&
      !intermediateStops.some((s) => s._id === c._id),
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading cities and points...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="form">
      {showDescription && (
        <div style={{ background: "var(--bg-secondary)", padding: "12px 14px", borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Use the city search fields to choose source and destination. Intermediate stops and point selection are loaded per selected city.
        </div>
      )}

      <div className="form-group">
        <label>Source City (Departure) *</label>
        <input
          className="form-control"
          type="text"
          placeholder="Search source city..."
          value={sourceSearch}
          onChange={(e) => setSourceSearch(e.target.value)}
        />
        {sourceSearch && (
          <div className="search-dropdown">
            {filteredSourceCities.length > 0 ? (
              filteredSourceCities.map((city) => (
                <button
                  key={city._id}
                  type="button"
                  className="search-dropdown-item"
                  onClick={() => selectSourceCity(city)}
                >
                  {city.name}
                </button>
              ))
            ) : (
              <div className="search-dropdown-empty">No city matches your search.</div>
            )}
          </div>
        )}
      </div>

      {sourceCity && (
        <div className="form-group">
          <label>Pickup Points in {sourceCity.name} *</label>
          <div className="checkbox-group">
            {(pointsByCity[sourceCity._id] || []).map((point) => (
              <div key={point._id} className="form-group-checkbox">
                <input
                  type="checkbox"
                  id={`source-${point._id}`}
                  checked={sourcePickupPoints.some((p) => p._id === point._id)}
                  onChange={() => handleSourcePointChange(point._id)}
                />
                <label htmlFor={`source-${point._id}`}>{point.name}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Intermediate Stops (Optional)</label>
        <input
          className="form-control"
          type="text"
          placeholder={availableCitiesForIntermediate.length === 0 ? "No more intermediate cities" : "Search intermediate city..."}
          value={intermediateSearch}
          onChange={(e) => setIntermediateSearch(e.target.value)}
          disabled={availableCitiesForIntermediate.length === 0}
        />
        {intermediateSearch && (
          <div className="search-dropdown">
            {filteredIntermediateCities.length > 0 ? (
              filteredIntermediateCities.map((city) => (
                <button key={city._id} type="button" className="search-dropdown-item" onClick={() => { addIntermediateStop(city._id); setIntermediateSearch(""); }}>
                  {city.name}
                </button>
              ))
            ) : (
              <div className="search-dropdown-empty">No city matches your search.</div>
            )}
          </div>
        )}

        {intermediateStops.map((city) => (
          <div key={city._id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <strong>{city.name}</strong>
              <button
                type="button"
                onClick={() => removeIntermediateStop(city._id)}
                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "18px" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Pickup Points</label>
                <div className="checkbox-group" style={{ marginTop: "8px" }}>
                  {(pointsByCity[city._id] || []).map((point) => (
                    <div key={`pickup-${point._id}`} className="form-group-checkbox">
                      <input
                        type="checkbox"
                        id={`intermediate-pickup-${city._id}-${point._id}`}
                        checked={intermediatePoints[city._id]?.pickup?.some((p) => p._id === point._id) || false}
                        onChange={() => handleIntermediatePointChange(city._id, point._id, "pickup")}
                      />
                      <label htmlFor={`intermediate-pickup-${city._id}-${point._id}`}>{point.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Drop Points</label>
                <div className="checkbox-group" style={{ marginTop: "8px" }}>
                  {(pointsByCity[city._id] || []).map((point) => (
                    <div key={`drop-${point._id}`} className="form-group-checkbox">
                      <input
                        type="checkbox"
                        id={`intermediate-drop-${city._id}-${point._id}`}
                        checked={intermediatePoints[city._id]?.drop?.some((p) => p._id === point._id) || false}
                        onChange={() => handleIntermediatePointChange(city._id, point._id, "drop")}
                      />
                      <label htmlFor={`intermediate-drop-${city._id}-${point._id}`}>{point.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Destination City (Arrival) *</label>
        <input
          className="form-control"
          type="text"
          placeholder="Search destination city..."
          value={destinationSearch}
          onChange={(e) => setDestinationSearch(e.target.value)}
        />
        {destinationSearch && (
          <div className="search-dropdown">
            {filteredDestinationCities.length > 0 ? (
              filteredDestinationCities.map((city) => (
                <button key={city._id} type="button" className="search-dropdown-item" onClick={() => selectDestinationCity(city)}>
                  {city.name}
                </button>
              ))
            ) : (
              <div className="search-dropdown-empty">No city matches your search.</div>
            )}
          </div>
        )}
      </div>

      {destinationCity && (
        <div className="form-group">
          <label>Drop Points in {destinationCity.name} *</label>
          <div className="checkbox-group">
            {(pointsByCity[destinationCity._id] || []).map((point) => (
              <div key={point._id} className="form-group-checkbox">
                <input
                  type="checkbox"
                  id={`destination-${point._id}`}
                  checked={destinationDropPoints.some((p) => p._id === point._id)}
                  onChange={() => handleDestinationPointChange(point._id)}
                />
                <label htmlFor={`destination-${point._id}`}>{point.name}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {(sourceCity || destinationCity) && (
        <div style={{ background: "var(--bg-secondary)", padding: "12px 14px", borderRadius: "var(--radius-md)", marginTop: "16px" }}>
          <strong>Route Summary:</strong>
          <ul style={{ margin: "8px 0 0 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
            {sourceCity && <li>{sourceCity.name} (Departure)</li>}
            {intermediateStops.map((city) => (
              <li key={city._id}>{city.name} (Stop)</li>
            ))}
            {destinationCity && <li>{destinationCity.name} (Destination)</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
