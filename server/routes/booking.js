// ============================
// Booking Routes
// ============================
// POST /api/booking/create     - Book a seat (user only)
// GET  /api/booking/my         - Get logged-in user's bookings
// GET  /api/booking/bus/:busId - Get bookings for a bus (operator)

const express = require("express");
const Booking = require("../models/Booking");
const Bus = require("../models/Bus");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// --- BOOK A SEAT ---
// Only logged-in users can book seats
router.post("/create", verifyToken, authorizeRoles("user"), async (req, res) => {
  try {
    const { busId, seatNumber } = req.body;

    if (!busId || !seatNumber) {
      return res.status(400).json({ message: "Bus ID and seat number are required." });
    }

    // Check if the bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found." });
    }

    // Check if seat number is valid (within total seats)
    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return res.status(400).json({
        message: `Seat number must be between 1 and ${bus.totalSeats}.`,
      });
    }

    // Check if seat is already booked
    const existingBooking = await Booking.findOne({
      busId,
      seatNumber,
      status: "confirmed",
    });
    if (existingBooking) {
      return res.status(400).json({ message: "This seat is already booked." });
    }

    // Create the booking
    const booking = await Booking.create({
      userId: req.user.id,
      busId,
      seatNumber,
    });

    res.status(201).json({ message: "Seat booked successfully!", booking });
  } catch (error) {
    // Handle duplicate key error (race condition for same seat)
    if (error.code === 11000) {
      return res.status(400).json({ message: "This seat is already booked." });
    }
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// --- GET USER'S BOOKINGS ---
// Get all bookings for the logged-in user
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("busId", "busName from to departureTime arrivalTime price")
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET BOOKINGS FOR A BUS ---
// Operators can view bookings for their own buses
router.get("/bus/:busId", verifyToken, authorizeRoles("operator"), async (req, res) => {
  try {
    // Verify the operator owns this bus
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found." });
    if (bus.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view bookings for your own buses." });
    }

    const bookings = await Booking.find({ busId: req.params.busId })
      .populate("userId", "name email")
      .sort({ seatNumber: 1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get bus bookings error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- CANCEL A BOOKING ---
router.put("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Only the user who made the booking can cancel it
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own bookings." });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully!" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
