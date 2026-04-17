"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchPointsByCity } from "@/app/utils/api";

interface BusDetailsWithPointsProps {
  bus: any;
  route: {
    source: string;
    destination: string;
  };
  onPointsSelect: (pickupPoint: any, dropPoint: any) => void;
}

export default function BusDetailsWithPoints({
  bus,
  route,
  onPointsSelect,
}: BusDetailsWithPointsProps) {
  const [sourcePoints, setSourcePoints] = useState<any[]>([]);
  const [destinationPoints, setDestinationPoints] = useState<any[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<any>(null);
  const [selectedDropPoint, setSelectedDropPoint] = useState<any>(null);
  const [loadingSourcePoints, setLoadingSourcePoints] = useState(false);
  const [loadingDestPoints, setLoadingDestPoints] = useState(false);

  // Find city IDs from route
  const sourceCity = bus.route?.find((r: any) =>
    r.cityName.toLowerCase() === route.source.toLowerCase()
  );
  const destCity = bus.route?.find((r: any) =>
    r.cityName.toLowerCase() === route.destination.toLowerCase()
  );

  // Fetch points for source city
  useEffect(() => {
    if (sourceCity?._id) {
      fetchPointsForCity(sourceCity._id, "source");
    }
  }, [sourceCity?._id]);

  // Fetch points for destination city
  useEffect(() => {
    if (destCity?._id) {
      fetchPointsForCity(destCity._id, "destination");
    }
  }, [destCity?._id]);

  const fetchPointsForCity = async (cityId: string, type: "source" | "destination") => {
    try {
      if (type === "source") {
        setLoadingSourcePoints(true);
      } else {
        setLoadingDestPoints(true);
      }

      const points = await fetchPointsByCity(cityId);
      
      if (type === "source") {
        // Use pickupPoints if available, otherwise use all points
        const pickupPoints = sourceCity?.pickupPoints || points;
        setSourcePoints(pickupPoints);
      } else {
        // Use dropPoints if available, otherwise use all points
        const dropPoints = destCity?.dropPoints || points;
        setDestinationPoints(dropPoints);
      }
    } catch (error) {
      console.error("Failed to fetch points:", error);
    } finally {
      if (type === "source") {
        setLoadingSourcePoints(false);
      } else {
        setLoadingDestPoints(false);
      }
    }
  };

  const handlePickupChange = (point: any) => {
    setSelectedPickupPoint(point);
    if (selectedDropPoint) {
      onPointsSelect(point, selectedDropPoint);
    }
  };

  const handleDropChange = (point: any) => {
    setSelectedDropPoint(point);
    if (selectedPickupPoint) {
      onPointsSelect(selectedPickupPoint, point);
    }
  };

  const pointOptions = (points: any[]) =>
    points.map((point: any) => ({
      value: point._id || point.pointId,
      label: point.fullName || point.name,
      ...point,
    }));

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      {/* Bus Info Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
            {bus.busName}
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              margin: "4px 0 0 0",
            }}
          >
            {bus.busNumber} • {bus.busType}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary-color)" }}>
            ₹{bus.basePrice}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            {bus.totalSeats} Seats
          </div>
        </div>
      </div>

      {/* Route & Timing Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Departure
          </p>
          <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>
            {bus.departureTime}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Arrival
          </p>
          <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>
            {bus.arrivalTime}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Route
          </p>
          <p style={{ fontSize: "12px", fontWeight: "600", margin: 0 }}>
            {route.source} → {route.destination}
          </p>
        </div>
      </div>

      {/* Pickup & Drop Points Selection */}
      {sourcePoints.length > 0 && destinationPoints.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "var(--text-primary)",
            }}
          >
            Select Boarding & Drop Points
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "12px",
            }}
          >
            {/* Pickup Point Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                Boarding Point *
              </label>
              <Select
                options={pointOptions(sourcePoints)}
                value={selectedPickupPoint}
                onChange={handlePickupChange}
                isLoading={loadingSourcePoints}
                classNamePrefix="react-select"
                placeholder="Select boarding point..."
                isSearchable
                isClearable
              />
            </div>

            {/* Drop Point Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                Drop Point *
              </label>
              <Select
                options={pointOptions(destinationPoints)}
                value={selectedDropPoint}
                onChange={handleDropChange}
                isLoading={loadingDestPoints}
                classNamePrefix="react-select"
                placeholder="Select drop point..."
                isSearchable
                isClearable
              />
            </div>
          </div>

          {selectedPickupPoint && selectedDropPoint && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              ✓ Boarding from {selectedPickupPoint.label} → Dropping at{" "}
              {selectedDropPoint.label}
            </div>
          )}
        </div>
      )}

      {/* Amenities */}
      {bus.amenities && bus.amenities.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Amenities
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {bus.amenities.map((amenity: string, index: number) => (
              <span
                key={index}
                style={{
                  background: "var(--bg-tertiary)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
