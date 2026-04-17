import mongoose from "mongoose";
import Bus from "../models/bus.js";
import Booking from "../models/booking.js";
import { sendOTP } from "../utils/sendMail.js";

// 3.1 Search APIs
export async function SearchBuses(req, res) {
  try {
    const { source, destination, date } = req.query;
    if (!source || !destination || !date) {
      return res.status(400).json({ message: "Missing search params" });
    }

    const buses = await Bus.find({ isActive: true });
    const result = [];
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    for (let bus of buses) {
      const stops = bus.routeStops;
      const startIndex = stops.findIndex(s => s.toLowerCase() === source.toLowerCase());
      const endIndex = stops.findIndex(s => s.toLowerCase() === destination.toLowerCase());

      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) continue;

      let status = "AVAILABLE";
      let reason = "";

      if (bus.disabledDates?.includes(date)) {
        status = "NOT_RUNNING";
        reason = "Bus not available on this date";
      } else if (bus.scheduleType === "SpecificDays" && !bus.daysOfWeek.includes(dayName)) {
        status = "NOT_RUNNING";
        reason = `Runs only on ${bus.daysOfWeek.join(", ")}`;
      } else if (bus.scheduleType === "SpecificDates" && !bus.specificDates.includes(date)) {
        status = "NOT_RUNNING";
        reason = "Not scheduled on this date";
      }

      let availableSeats = 0;
      if (status === "AVAILABLE") {
        const bookings = await Booking.find({ busId: bus._id, travelDate: date, status: { $in: ["Booked", "PendingVerification"] } });
        for (let seat = 1; seat <= bus.totalSeats; seat++) {
          let isBooked = false;
          for (let b of bookings) {
            const bStart = stops.indexOf(b.startStop);
            const bEnd = stops.indexOf(b.endStop);
            if (startIndex < bEnd && endIndex > bStart && b.seatNumber === seat) {
              isBooked = true;
              break;
            }
          }
          if (!isBooked) availableSeats++;
        }
        if (availableSeats === 0) {
          status = "FULL";
          reason = "No seats available";
        }
      }

      result.push({
        ...bus.toObject(),
        status,
        reason,
        availableSeats,
        priceEst: Math.round(((endIndex - startIndex) / (stops.length - 1)) * bus.basePrice)
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
}

// 3.2 Lock Seat & Send Verification
export async function LockSeat(req, res) {
  try {
    const { name, email, phone, busId, startStop, endStop, seatNumber, date } = req.body;
    if (!name || !email || !phone || !busId || !startStop || !endStop || !seatNumber || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const stops = bus.routeStops;
    const startIndex = stops.findIndex(s => s.toLowerCase() === startStop.toLowerCase());
    const endIndex = stops.findIndex(s => s.toLowerCase() === endStop.toLowerCase());

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      return res.status(400).json({ message: "Invalid routing" });
    }

    // Check if seat is booked or pending
    const existingBookings = await Booking.find({
      busId,
      travelDate: date,
      seatNumber,
      status: { $in: ["Booked", "PendingVerification"] }
    });

    for (let b of existingBookings) {
      // If the pending verification is expired, skip conflict check
      if (b.status === "PendingVerification" && new Date() > new Date(b.verificationCodeExpires)) {
        continue; 
      }
      const eStart = stops.findIndex(s => s.trim().toLowerCase() === b.startStop.trim().toLowerCase());
      const eEnd = stops.findIndex(s => s.trim().toLowerCase() === b.endStop.trim().toLowerCase());
      if (startIndex < eEnd && endIndex > eStart) {
        return res.status(400).json({ message: `Seat ${seatNumber} already booked/locked` });
      }
    }

    const price = Math.round(((endIndex - startIndex) / (stops.length - 1)) * bus.basePrice);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const booking = new Booking({
      name, email, phone, busId, startStop, endStop, seatNumber,
      travelDate: date, price,
      verificationCode: otp,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      paymentStatus: "Pending",
      status: "PendingVerification",
      userId: req.user?.userId || null
    });

    await booking.save();

    // Send Mail
    await sendOTP(email, otp, {
      name, source: startStop, destination: endStop, date, seats: [seatNumber], totalPrice: price
    }, "BOOKING_VERIFICATION");

    res.status(201).json({ message: "Seat locked. Verification code sent to email.", bookingId: booking._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to lock seat", error: error.message });
  }
}

// 3.3 Verify Booking Code
export async function VerifyBooking(req, res) {
  try {
    const { bookingId, otp } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "Booked") return res.status(400).json({ message: "Already verified" });
    if (new Date() > new Date(booking.verificationCodeExpires)) {
      booking.status = "Cancelled";
      await booking.save();
      return res.status(400).json({ message: "Code expired. Booking cancelled." });
    }
    if (booking.verificationCode !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Success
    booking.status = "Booked";
    booking.paymentStatus = "Paid";
    await booking.save();

    // Send Confirmation Mail
    await sendOTP(booking.email, null, {
      pnr: booking._id.toString().slice(-6).toUpperCase(),
      source: booking.startStop, destination: booking.endStop, date: booking.travelDate, seats: [booking.seatNumber]
    }, "BOOKING_CONFIRMATION");

    res.json({ success: true, message: "Booking confirmed!", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// 3.4 Cancel Ticket
export async function CancelTicket(req, res) {
  try {
    const { bookingId } = req.body;
    // Assuming req.user is set by auth middleware, or they can cancel by email+phone
    const booking = await Booking.findOne({ _id: bookingId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Note: if user is logged in, ensure it belongs to them
    if (req.user && req.user.role === "USER" && booking.userId?.toString() !== req.user.userId) {
       return res.status(403).json({ message: "Forbidden" });
    }

    if (new Date(booking.travelDate) <= new Date()) {
      return res.status(400).json({ message: "Cannot cancel past bookings" });
    }

    booking.status = "Cancelled";
    if (booking.paymentStatus === "Paid") {
      booking.paymentStatus = "Refunded";
    }
    await booking.save();

    res.json({ success: true, message: "Ticket cancelled successfully and refund initiated." });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// 3.5 Specific Bus Lookup
export async function GetBusByID(req, res) {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: "Failed", error: error.message });
  }
}
