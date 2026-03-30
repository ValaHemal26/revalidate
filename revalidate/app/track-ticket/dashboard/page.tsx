"use client";
import { useRouter } from "next/navigation";
import  "../../assets/css/style.css";
import Cookies from "js-cookie";
export default function Dashboard() {
    const router = useRouter();
    const cookieData = Cookies.get("bookings");

    let bookings = [];

    if (cookieData) {
        try {
            bookings = JSON.parse(decodeURIComponent(cookieData));
        } catch (err) {
            console.error("Invalid cookie data", err);
        }
    }
    const latest = bookings[0]; 
    const isFuture = new Date(latest?.travelDate) > new Date();

    return (
        <>
        <h2>Last Booking</h2>

        <div className="card">
            <p>{latest.startStop} → {latest.endStop}</p>
            <p>Date: {latest.travelDate}</p>
            <p>Seat: {latest.seatNumber}</p>

            {isFuture && (
            <div className="actions">
                <button>Cancel</button>
                <button>Update</button>
            </div>
            )}
        </div>

        <button
            className="secondaryBtn"
            onClick={() => router.push("/track-ticket/history")}
        >
            View History
        </button>
        </>
    );
}