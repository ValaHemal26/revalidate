"use client";
import "../assets/css/style.css";
export default function SeatLayout({ seats, selected, setSelected,bookedSeats }: any) {
  console.log(bookedSeats);
  return (
    <>
    <div className="seat-legend">
      <div className="legend-item">
        <span className="legend-box available"></span>
        <span>Available</span>
      </div>

      <div className="legend-item">
        <span className="legend-box selected"></span>
        <span>Selected</span>
      </div>

      <div className="legend-item">
        <span className="legend-box booked"></span>
        <span>Booked</span>
      </div>
    </div>

    <div className="seat-layout">
      {Array.from({ length: seats }).map((e, i) => {
        const seatNumber = i + 1;
        return (
          <button
            disabled={bookedSeats?.includes(seatNumber)}
            key={seatNumber}
            className={
              "seat " +
              (bookedSeats?.includes(seatNumber) ? "booked " : "") +
              (selected == seatNumber ? "selected " : "") + " seat-btn"
            }
            onClick={() => {
              if (bookedSeats?.includes(seatNumber)) return;
              // if (selected.includes(seatNumber)) {
    
              //   setSelected(selected.filter((s: number) => s !== seatNumber));
              // } else {
              //   setSelected([...selected, seatNumber]);
              // }
               setSelected([seatNumber]); 
            }}
          >
            {seatNumber}
          </button>
        );
      })}
    </div>
    </>
  );
}