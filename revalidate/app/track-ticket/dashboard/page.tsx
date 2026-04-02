"use client";

import  "../../assets/css/style.css";
import Cookies from "js-cookie";
import { useState } from "react";
export default function Dashboard() {
    const [showHistory,setShowHistory] = useState(false);
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
    function handleCancelClick(){

    }
    return (
        <>
        <h2>Last Booking</h2>

       
           <div className="card">
            {bookings.length === 0 ? (
                <p>No bookings found</p>
            ) : (
                <>
                <p>{latest?.startStop} → {latest?.endStop}</p>
                <p>Date: {latest?.travelDate}</p>
                <p>Seat: {latest?.seatNumber}</p>

                {isFuture && (
                    <div className="actions">
                    <button className="btn-cancel" onClick={handleCancelClick}>Cancel Booking</button>
                    <button>Update Booking</button>
                    </div>
                )}
                </>
            )}
            </div>
          

        <button
            className="secondaryBtn"
            onClick={() =>  setShowHistory(prev => !prev)}
        >
           {showHistory ? "Hide History" : "View History"}
        </button>
        {showHistory &&
           <div className={"track-ticket-history " + (showHistory ? "show" : "")}>

                <h2>Booking History</h2>
            {bookings.length === 0 ? (
                <p>No bookings found</p>
            ) : (
                <>
                {bookings.map((b) => (
                    <div key={b?._id} className="card">
                    <p>{b?.startStop} → {b?.endStop}</p>
                    <p>{b?.travelDate}</p>
                    <p>Status: {b?.status}</p>
                    </div>
                ))}
                </>
            )}
            </div>  
        }
        </>
    );
}