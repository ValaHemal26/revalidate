import Link from "next/link";

export default function BusCard({ bus, date, destination, source }: any) {
  if (!bus.length) {
    return <p>No buses found</p>;
  }

  return (
    <div className="bus-list">
      {bus.map((b: any) => {
        const isDisabled = b.status !== "AVAILABLE";

        return (
          <div
            className={`bus-card ${isDisabled ? "disabled" : ""}`}
            key={b._id}
          >
            <div className="bus-header">
              <h3>{b.busName}</h3>
              <span className="bus-date">{date}</span>
            </div>

            <div className="bus-route">
              {b.routeStops[0]} → {b.routeStops[b.routeStops.length - 1]}
            </div>

            <div className="bus-time">
              <div>
                <strong>{b.departureTime}</strong>
                <p>Departure</p>
              </div>

              <div className="duration">—</div>

              <div>
                <strong>{b.arrivalTime}</strong>
                <p>Arrival</p>
              </div>
            </div>

            <div className="bus-status">
              <strong>Status:</strong> {b.status}
              {b.reason && <p className="reason">{b.reason}</p>}
            </div>

            <div className="bus-schedule">
              <strong>Schedule:</strong> {b.scheduleInfo.type}

              {b.scheduleInfo.type === "SpecificDays" && (
                <p>Days: {b.scheduleInfo.days.join(", ")}</p>
              )}

              {b.scheduleInfo.type === "SpecificDates" && (
                <p>Dates: {b.scheduleInfo.dates.join(", ")}</p>
              )}
            </div>

            <Link
              href={
                !isDisabled
                  ? `/bookings/${b._id}?date=${date}&source=${source}&destination=${destination}`
                  : "#"
              }
            >
              <button className="book-btn" disabled={isDisabled}>
                {isDisabled ? "Not Available" : "Book Now"}
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}