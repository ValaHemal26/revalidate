import express from "express";
import { SearchBuses, LockSeat, VerifyBooking, CancelTicket, GetBusByID } from "../controller/booking.controller.mjs";
import { verifyToken } from "../middleware/auth.middleware.mjs";

export default function bookingRoutes(router) {
  router.get("/buses/search", SearchBuses);
  router.get("/buses/:id", GetBusByID);
  
  // Optional auth for booking
  router.post("/bookings/lock", (req, res, next) => {
     // Run soft token verification if provided
     const token = req.headers.authorization?.split(" ")[1];
     if (token) {
        verifyToken(req, res, () => next());
     } else {
        next();
     }
  }, LockSeat);

  router.post("/bookings/verify", VerifyBooking);
  
  router.post("/bookings/cancel", (req, res, next) => {
     const token = req.headers.authorization?.split(" ")[1];
     if (token) {
        verifyToken(req, res, () => next());
     } else {
        next();
     }
  }, CancelTicket);
}
