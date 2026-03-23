"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter,useParams  } from "next/navigation";
import { getBus, bookSeat } from "../../utils/api";
import BookingForm from "../../components/BookingForm";
export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || "";
  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const {busId} = params;
  
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [startStop, setStartStop] = useState("");
  const [endStop, setEndStop] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    async function fetchBus () {
      try {
        const res = await getBus(busId);
        setBus(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (busId) {
      console.log(busId);
      fetchBus();
    }
  }, [busId]);

  const handleSeatToggle = (seat: number) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (!startStop || !endStop || selectedSeats.length === 0) {
      setError("Please select start & end stops and at least one seat");
      return;
    }

    try {
      await bookSeat({
        busId,
        travelDate: date,
        startStop,
        endStop,
        seatNumbers: selectedSeats,
      });
      alert("Booking successful!");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading bus info...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!bus) return null;

  const totalSeats = bus.totalSeats;
  const seatNumbers = Array.from({ length: totalSeats }, (_, i) => i + 1);

  return (
    <>
      <div className="booking-page">
        <h2>Booking: {bus.busName}</h2>
        <p>
          Route: {bus.routeStops.join(" → ")} | Date: {date}
        </p>

     
         <BookingForm bus={bus} date={date} source={source} destination={destination}/>
      </div>
     
    </>
  );
}