import Link from "next/link";

export default function BusCard({ bus, date }: any) {
  return (
    <div>
      {bus && bus.map((b: any) => (
        <div className="bus-card" key={b._id}>
          <h3>{b.busName}</h3>
          <p>{b.routeStops.join(" → ")}</p>
          <p>{b.departureTime} - {b.arrivalTime}</p>
          <Link href={`/booking/${b._id}?date=${date}`}>
            <button>Book Now</button>
          </Link>
        </div>
      ))}
    </div>
  );
}