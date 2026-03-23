"use client";
import "../../assets/css/style.css";
import { useEffect, useState } from "react";
import { useSearchParams,useParams  } from "next/navigation";
import { getBus } from "../../utils/api";
import BookingForm from "../../components/BookingForm";
import ErrorMessage from "../../components/ErrorMessage";

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || "";
  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const {busId} = params;
  
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  if(!source || !destination || !date) return <ErrorMessage message="Please All this fields: Travel Date,Source,Destination" />;

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
      fetchBus();
    }
  }, [busId]);

 
  if (loading) return <p>Loading bus info...</p>;
  if (error) return  <ErrorMessage message={error} />;
  if (!bus) return null;

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