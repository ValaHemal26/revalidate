import Link from "next/link";
export default function BusCard({ bus, date,destination,source }: any) {
  if (!bus.length) {
    return <p>No buses found</p>;
  }

  return (
    <div className="bus-list">
      {bus.map((b: any) => (
        <div className="bus-card" key={b._id}>
          <div className="bus-header">
            <h3>{b.busName}</h3>
            <span className="bus-date">{date}</span>
          </div>

          <div className="bus-route">
            {b.routeStops[0]} 
            <span className="arrow">→</span> 
            {b.routeStops[b.routeStops.length - 1]}
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

          <Link href={"/bookings/" + b._id + "?date=" + date + "&source=" + source + "&destination=" + destination }>
            <button className="book-btn">Book Now</button>
          </Link>
        </div>
      ))}
    </div>
  );
}