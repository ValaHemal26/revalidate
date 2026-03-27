"use client";
import "../../assets/css/style.css";
import  Cookies  from "js-cookie";
export default function History() {
    const cookieData = Cookies.get("bookings");
    
    let bookings = [];

    if (cookieData) {
        try {
            bookings = JSON.parse(decodeURIComponent(cookieData));
        } catch (err) {
            console.error("Invalid cookie data", err);
        }
    }
    return (
        <>
        <h2>Booking History</h2>

        {bookings.map((b) => (
            <div key={b._id} className="card">
            <p>{b.startStop} → {b.endStop}</p>
            <p>{b.travelDate}</p>
            <p>Status: {b.status}</p>
            </div>
        ))}
        </>
    );
}