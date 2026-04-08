"use client";

import "../../assets/css/style.css";
import { useState, useEffect } from "react";
import { getMyBookings,updateBooking } from "../../utils/api";
import UpdateModal from "../../components/UpdateModal";
import Cookies from "js-cookie";
import { SkeletonCards } from "../../components/SkeletonCards";

export default function Dashboard() {
  const token = Cookies.get("userToken");

  const [latestBooking, setLatestBooking] = useState(null);
  const [latestLoading, setLatestLoading] = useState(true);

  const [historyState, setHistoryState] = useState({
    bookings: [],
    page: 1,
    pages: 1,
    loading: true,
  });

  const [uiState, setUiState] = useState({
    showHistory: false,
    updateModal: {
      open: false,
      booking: null,
    },
  });

    useEffect(() => {
        async function fetchHistory() {
            setHistoryState(prev => ({ ...prev, loading: true }));
            await new Promise(resolve => setTimeout(resolve, 2000));
            const res = await getMyBookings(token, historyState.page, 5);

            if (res.success) {
                if(historyState.page == 1){
                    setLatestBooking(res.bookings[0]);
                }
                setHistoryState(prev => ({
                ...prev,
                bookings: res.bookings,
                pages: res.pages,
                loading: false,
                }));
            }
            setLatestLoading(false);
            setHistoryState(prev => ({...prev,loading:false}));
        }

        fetchHistory();
    }, [historyState.page]);

  const latest = latestBooking;
  const isFuture = new Date(latest?.travelDate) > new Date();
  const isActive = latest?.status === "Booked";

    async function handleUpdate(updatedData) {
       
        try {
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const data = await updateBooking(token, updatedData);

            if (latest?._id === updatedData.bookingId) {
                setLatestBooking(prev => ({
                    ...prev,
                    travelDate: updatedData.travelDate,
                    seatNumber: updatedData.seatNumber,
                }));

                setUiState(prev => ({
                    ...prev,
                    updateModal: { open: false, booking: null },
                }));
            }

            setHistoryState(prev => ({
                ...prev,
                bookings: prev.bookings.map(b =>
                    b._id === updatedData.bookingId
                    ? { ...b, ...updatedData }
                    : b
                ),
            }));

        } catch (err) {
            alert(err.message);
        }
    }
  console.log(uiState);
  console.log(uiState.updateModal.booking);
  return (
    <>
      <UpdateModal
        isOpen={uiState.updateModal.open}
        onClose={() =>
          setUiState(prev => ({
            ...prev,
            updateModal: { open: false, booking: null },
          }))
        }
        booking={uiState.updateModal.booking}
        onUpdate={handleUpdate}
      />

      <h2>Last Booking</h2>

      {latestLoading ? (
        <SkeletonCards count={1} />
      ) : (
        <div className="latest-card">
          {!latest ? (
            <p>No bookings found</p>
          ) : (
            <>
              <p>{latest.startStop} → {latest.endStop}</p>
              <p>Date: {latest.travelDate}</p>
              <p>Seat: {latest.seatNumber}</p>

              {isFuture && isActive && (
                <div className="actions">
                  <button className="btn-cancel">Cancel Booking</button>
                  <button
                    onClick={() =>
                      setUiState(prev => ({
                        ...prev,
                        updateModal: { open: true, booking: latest },
                      }))
                    }
                  >
                    Update Booking
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button
        className="secondaryBtn"
        onClick={() =>{
                setUiState(prev => ({
                    ...prev,
                    showHistory: !prev.showHistory,
                }))
            }
        }
      >
        {uiState.showHistory ? "Hide History" : "View History"}
      </button>

      {uiState.showHistory && (
        <div className="track-ticket-history show">
          <h2>Booking History</h2>

          {historyState.loading ? (
            <SkeletonCards count={5} />
          ) : historyState.bookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <>
              {historyState.bookings.map(b => (
                <div key={b._id} className="card">
                  <p>{b.startStop} → {b.endStop}</p>
                  <p>{b.travelDate}</p>
                  <p>Status: {b.status}</p>
                </div>
              ))}

              <div className="pagination">
                <button
                  disabled={historyState.page === 1}
                  onClick={() =>
                    setHistoryState(prev => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                >
                  Prev
                </button>

                <button
                  disabled={historyState.page === historyState.pages}
                  onClick={() =>
                    setHistoryState(prev => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}