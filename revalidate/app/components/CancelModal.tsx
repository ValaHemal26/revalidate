"use client";
import "../assets/css/style.css";
import { useRef } from "react";

export default function CancelModal({
  isOpen,
  onClose,
  bookingId,
  onConfirm,
}: any) {
  const throttleRef = useRef(null);

  if (!isOpen) return null;

  function handleConfirm() {
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, 4000);

    onConfirm(bookingId);
  }

  return (
    <div className="overlay">
      <div className="update-modal">
        <h2>Cancel Booking</h2>

        <p>Are you sure you want to cancel this booking?</p>

        <div className="cancel-actions">
          <button className="btn secondary" onClick={onClose}>
            No
          </button>

          <button className="btn danger" onClick={handleConfirm}>
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}