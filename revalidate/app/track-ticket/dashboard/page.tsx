"use client";

import "../../assets/css/style.css";
import { useState, useEffect,useMemo } from "react";
import { getMyBookings,updateBooking,cancelBooking } from "../../utils/api";
import UpdateModal from "../../components/UpdateModal";
import {LoaderModal } from "../../components/LoaderModal"; "../../components/LoaderModal";
import Cookies from "js-cookie";
import CancelModal from "../../components/CancelModal";
import ErrorMessage from "../../components/ErrorMessage"; 
import { SkeletonCards } from "../../components/SkeletonCards";


export default function Dashboard() {
      const token = Cookies.get("userToken");

      const [upcomingTrips, setUpcomingTrips] = useState({
        trips: [],
        loading: true,
      });
      const [UpdateBookingLoading, setUpdateBookingLoading] = useState(false);
      const [CancelBookingLoading, setCancelBookingLoading] = useState(false);
      const [error, setError] = useState("");

      const [filters, setFilters] = useState({
        status: "ALL",
        fromDate: "",
        toDate: "",
      });

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
        cancelModal: {
          open: false,
          bookingId: null
        },
      });
      const today = new Date();
      var  upcomingBookings = useMemo(() => {
        return upcomingTrips.trips.filter(
          (b) =>
            b.status === "Booked" &&
            new Date(b.travelDate) >= today
        );
      }, [upcomingTrips.trips]);
      
      const filteredHistory = useMemo(() => {
        return historyState.bookings.filter((b) => {
          const travelDate = new Date(b.travelDate);

          const matchStatus =
            filters.status === "ALL" || b.status === filters.status;

          const matchFrom =
            !filters.fromDate ||
            travelDate >= new Date(filters.fromDate);

          const matchTo =
            !filters.toDate ||
            travelDate <= new Date(filters.toDate);

          return matchStatus && matchFrom && matchTo;
        });
      }, [historyState.bookings, filters]);

      useEffect(() => {
          async function fetchHistory() {
              setHistoryState(prev => ({ ...prev, loading: true }));
              await new Promise(resolve => setTimeout(resolve, 2000));
              const res = await getMyBookings(token, historyState.page, 5);

              if (res.success) {
                  if(historyState.page === 1){
                      setUpcomingTrips(prev => ({...prev,trips:res.bookings}));
                  }
                  setHistoryState(prev => ({
                    ...prev,
                    bookings: res.bookings,
                    pages: res.pages,
                    loading: false,
                  }));
              }else{
                 setError(res.message || "Something went wrong");
              }
              setUpcomingTrips(prev => ({...prev,loading:false}));
              setHistoryState(prev => ({...prev,loading:false}));
          }

          fetchHistory();
      }, [historyState.page]);
    
    
      async function handleUpdate(updatedData) {
        
          try {
              setUpdateBookingLoading(true);
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const data = await updateBooking(token, updatedData);
          
              setUiState(prev => ({
                  ...prev,
                  updateModal: { open: false, booking: null },
              }));
              
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
          }finally{
            setUpdateBookingLoading(false);
          }
      }

      async function handleCancel(bookingId) {
        try {
          setCancelBookingLoading(true);
          await new Promise(resolve => setTimeout(resolve, 1500));

          await cancelBooking(token, bookingId);

        
          setHistoryState(prev => ({
            ...prev,
            bookings: prev.bookings.map(b =>
              b._id === bookingId ? { ...b, status: "Cancelled" } : b
            ),
          }));

          setUiState(prev => ({
            ...prev,
            cancelModal: { open: false, bookingId: null },
          }));

        } catch (err) {
          alert(err.message);
        } finally {
          setCancelBookingLoading(false);
        }
      }
        

  return (
    <>
      <ErrorMessage message={error} />
      <LoaderModal show={UpdateBookingLoading} message="Updating Your Booking..." />
      <LoaderModal show={CancelBookingLoading} message="Cancelling Your Booking..." />
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

      <CancelModal
        isOpen={uiState.cancelModal.open}
        bookingId={uiState.cancelModal.bookingId}
        onClose={() =>
          setUiState(prev => ({
            ...prev,
            cancelModal: { open: false, bookingId: null },
          }))
        }
        onConfirm={handleCancel}
      />
      <h2>Upcoming Trips</h2>

      {upcomingTrips.loading ? (
          <SkeletonCards count={2} />
        ) : upcomingBookings.length === 0 ? (
          <p className="card">No upcoming trips</p>
        ):( upcomingBookings.map((b) => (
          <div key={b._id} className="card highlight">
            <p>{b.startStop} → {b.endStop}</p>
            <p>Date: {b.travelDate}</p>
            <p>Seat: {b.seatNumber}</p>

            <div className="actions">
              <button
                className="btn-cancel"
                onClick={() =>
                  setUiState((prev) => ({
                    ...prev,
                    cancelModal: { open: true, bookingId: b._id },
                  }))
                }
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  setUiState((prev) => ({
                    ...prev,
                    updateModal: { open: true, booking: b },
                  }))
                }
              >
                Reschedule
              </button>
            </div>
          </div>
        ))
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
            <p className="card">No bookings found</p>
          ) : (
            <>
              <h3>Filters</h3>
              <div className="filters">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="ALL">All</option>
                  <option value="Booked">Booked</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value })
                  }
                />

                <input
                  type="date"
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value })
                  }
                />

                <button
                  onClick={() =>
                    setFilters({ status: "ALL", fromDate: "", toDate: "" })
                  }
                >
                  Reset
                </button>
              </div>
              <div className="applied-filters">
                <p><strong>Applied Filters:</strong></p>
                <ul>
                  {filters.status !== "ALL" && <li>Status: {filters.status}</li>}
                  {filters.fromDate && <li>From: {filters.fromDate}</li>}
                  {filters.toDate && <li>To: {filters.toDate}</li>}
                  {filters.status === "ALL" && !filters.fromDate && !filters.toDate && (
                    <li>None</li>
                  )}
                </ul>
              </div>
              {filteredHistory.map(b => (
                <div key={b._id} className="card">
                  <p>{b.startStop} → {b.endStop}</p>
                  <p>{b.travelDate}</p>
                  <p>Status: {b.status}</p>
                </div>
              ))}
              {filteredHistory.length > 0 && (
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
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}