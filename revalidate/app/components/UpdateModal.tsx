"use client";
import { useEffect, useState } from "react";
import SeatLayout from "./SeatLayout";
import { checkSeatAvailability, getBus } from "../utils/api";

export default function UpdateModal({
    isOpen,
    onClose,
    booking,
    onUpdate
    }: any) {
    const [step, setStep] = useState(1);

    const [bus, setBus] = useState<any>(null);
    const [newDate, setNewDate] = useState("");
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [bookedSeats, setBookedSeats] = useState<number[]>([]);
        
    useEffect(() => {
        if (isOpen && booking) {
        fetchBus();
        setNewDate(booking.travelDate?.split("T")[0]);
        setSelectedSeats([booking.seatNumber]);
        }
        }, [isOpen]);

        async function fetchBus() {
        const data = await getBus(booking.busId);
        setBus(data);
    }

    async function fetchSeats(date: string) {
        console.log("fetch")
        try {
            const res = await checkSeatAvailability(booking);
             
            setBookedSeats(res.bookedSeats || []);
        } catch (err) {
            console.error(err);
        }
    }

    function handleDateChange(e: any) {
        const date = e.target.value;
        setNewDate(date);
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

    async function handleSubmit() {
        await onUpdate({
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
                    <p><b>Seat:</b> {selectedSeats[0]}</p>
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


    );
}
