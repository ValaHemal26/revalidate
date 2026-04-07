"use client";

import  "../../assets/css/style.css";
import { useState,useEffect } from "react";
import { getMyBookings } from "../../utils/api";
import UpdateModal from "../../components/UpdateModal";
import Cookies from "js-cookie";

export default function Dashboard() {
    const [showHistory,setShowHistory] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUpdate, setShowUpdate] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        async function fetchBookings() {
        const res = await getMyBookings();

            if (res.success) {
                setBookings(res.bookings);
            }

            setLoading(false);
        }

        fetchBookings();
    }, []);

    const token = Cookies.get("token");
    console.log(token);
    const latest = bookings[0]; 
    const isFuture = new Date(latest?.travelDate) > new Date();
    const isActive = latest?.status === "Booked";
    async function handleUpdate(updatedData: any) {
        console.log(updatedData);
        try {
            const res = await fetch("http://localhost:5000/api/v1/user/update-booking", {
                method: "POST",
                headers: {
                    'Authorization': "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setBookings(prev =>
                prev.map(b =>
                    b._id === updatedData.bookingId
                    ? {
                        ...b,
                        travelDate: updatedData.travelDate,
                        seatNumber: updatedData.seatNumber
                        }
                    : b
                )
            );

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    }

    return (
        <>
            <UpdateModal
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                booking={selectedBooking}
                onUpdate={handleUpdate}
            />
            <h2>Last Booking</h2>
            
            {loading ? (
                <>
                <div className="skeleton-card">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
                <div className="skeleton-card">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
                </>
            ) : (
                <>
                    <div className="card">
                        {bookings.length === 0 ? (
                            <p>No bookings found</p>
                        ) : (
                            <>
                            <p>{latest?.startStop} → {latest?.endStop}</p>
                            <p>Date: {latest?.travelDate}</p>
                            <p>Seat: {latest?.seatNumber}</p>

                            {isFuture && isActive && (
                                <div className="actions">
                                    <button className="btn-cancel" >Cancel Booking</button>
                                    <button onClick={() => {
                                        setSelectedBooking(latest);
                                        setShowUpdate(true);
                                        }}>
                                        Update Booking
                                    </button>
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
            )}
        </>
    );
}