"use client";
import "../assets/css/style.css";
export default function SeatLayout({ seats, selected, setSelected }: any) {
  return (
    <div className="seat-layout">
      {Array.from({ length: seats }).map((e, i) => {
        const seatNumber = i + 1;
        return (
          <button
            key={seatNumber}
            className={"seat " + (selected?.includes(seatNumber) ? "selected" : "") + " seat-btn" }
            onClick={() => {
              if (selected.includes(seatNumber)) {
    
                setSelected(selected.filter((s: number) => s !== seatNumber));
              } else {
                
                setSelected([...selected, seatNumber]);
              }
            }}
          >
            {seatNumber}
          </button>
        );
      })}
    </div>
  );
}