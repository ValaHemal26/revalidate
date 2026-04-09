"use client";
import { useEffect, useState } from "react";
import SeatLayout from "./SeatLayout";
import { checkSeatAvailability, getBus } from "../utils/api";
import { useRef } from "react";

export default function UpdateModal({
    isOpen,
    onClose,
    booking,
    onUpdate
    }: any) {
    const [step, setStep] = useState(1);
    const throttleRef = useRef(null);
    const [bus, setBus] = useState<any>(null);
    const [newDate, setNewDate] = useState("");
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
       
    useEffect(() => {
        if (isOpen && booking) {
            setStep(1);
            fetchBus();
            setNewDate(booking.travelDate?.split("T")[0]);
            setSelectedSeats([booking.seatNumber]);

            fetchSeats(booking.travelDate); 
        }
    }, [isOpen,booking]);

    async function fetchBus() {
        const data = await getBus(booking.busId);
        setBus(data);
    }

    async function fetchSeats(date) {
        try {
            const res = await checkSeatAvailability(booking, date);

            let seats = res.bookedSeats || [];
            
            if (date === booking.travelDate) {
                
                seats = seats.filter(
                    (seat) => seat !== booking.seatNumber
                );
            }

            setBookedSeats(seats);
            // setBookedSeats(res.bookedSeats || []);
        } catch (err) {
            console.error(err);
        }
    }

    function handleDateChange(e: any) {
        const date = e.target.value;
      
        setNewDate(date);

        if (date === booking.travelDate) {
            setSelectedSeats([booking.seatNumber]);
        } else {
            setSelectedSeats([]);
        }

        fetchSeats(date);
    }

    function handleNext() {
        if (step === 1 && !newDate) return;
        if (step === 2 && selectedSeats.length === 0) return;
        setStep(prev => prev + 1);
    }

    function handleBack() {
        setStep(prev => prev - 1);
    }

     function handleSubmit() {
        if (throttleRef.current) return; 
        throttleRef.current = setTimeout(() => {
            throttleRef.current = null;
        }, 5000);
        
        onUpdate({
            bookingId: booking._id,
            travelDate: newDate,
            seatNumber: selectedSeats[0]
        });
    }
    function handleClose() {
        setStep(1);
        setSelectedSeats([]);
        setNewDate("");
        setBookedSeats([]);
        onClose();
    }
   
    if (!isOpen) return null;
    return ( 
       <div className="overlay">
            <div className="update-modal">

                <h2 className="update-modal-title">Update Booking</h2>

                <div className="update-stepper">
                <div className={step >= 1 ? "active" : ""}>1. Date</div>
                <div className={step >= 2 ? "active" : ""}>2. Seat</div>
                <div className={step >= 3 ? "active" : ""}>3. Confirm</div>
                </div>

                {step === 1 && (
                    <div className="update-step">
                        <label>Select Date</label>
                        <input
                        type="date"
                        value={newDate}
                        onChange={handleDateChange}
                        className="update-input"
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="update-step">
                        <p>Select Seat</p>
                        {bus && (
                        <SeatLayout
                            seats={bus.totalSeats}
                            selected={selectedSeats}
                            setSelected={setSelectedSeats}
                            bookedSeats={bookedSeats}
                        />
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="update-step">
                        <p><b>Route:</b> {booking.startStop} → {booking.endStop}</p>
                        <p><b>Date:</b> {newDate}</p>
                        <p><b>Seat:</b> {Array.isArray(selectedSeats) ? selectedSeats.join(",") : 0}</p>
                    </div>
                )}

                <div className="update-actions">
                    {step > 1 && (
                        <button onClick={handleBack} className="update-btn secondary">
                        Back
                        </button>
                    )}

                    {step < 3 && (
                        <button onClick={handleNext} className="update-btn primary">
                        Next
                        </button>
                    )}

                    {step === 3 && (
                        <button onClick={handleSubmit} className="update-btn primary">
                        Confirm Update
                        </button>
                    )}

                    <button onClick={handleClose} className="update-btn cancel">
                        Close
                    </button>
                </div>
            </div>
        </div>

    );
}
