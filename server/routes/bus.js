// ============================
// Bus Routes (CRUD Operations)
// ============================
// POST   /api/bus/add         - Add a new bus (operator only)
// GET    /api/bus/all         - Get all buses (public)
// GET    /api/bus/search      - Search buses by from/to/date (public)
// GET    /api/bus/:id         - Get a single bus by ID (public)
// GET    /api/bus/operator/my - Get buses owned by the logged-in operator
// PUT    /api/bus/:id         - Update a bus (operator only)
// DELETE /api/bus/:id         - Delete a bus (operator only)

const express = require("express");
const Bus = require("../models/Bus");
const Booking = require("../models/Booking");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// --- ADD A NEW BUS ---
// Only operators can add buses
router.post("/add", verifyToken, authorizeRoles("operator"), async (req, res) => {
  try {
    const { busName, from, to, departureTime, arrivalTime, totalSeats, price } = req.body;

    // Basic validation
    if (!busName || !from || !to || !departureTime || !arrivalTime || !totalSeats || !price) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create the bus, linking it to the logged-in operator
    const bus = await Bus.create({
      busName,
      operatorId: req.user.id, // From the JWT token
      from,
      to,
      departureTime,
      arrivalTime,
      totalSeats,
      price,
    });

    res.status(201).json({ message: "Bus added successfully!", bus });
  } catch (error) {
    console.error("Add bus error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// --- GET ALL BUSES ---
// Anyone can view all buses (public route)
router.get("/all", async (req, res) => {
  try {
    // Populate operatorId to show operator's name
    const buses = await Bus.find().populate("operatorId", "name email").sort({ departureTime: 1 });
    res.json(buses);
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- SEARCH BUSES ---
// Search by departure city, destination city, and optional date
router.get("/search", async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Build the search filter
    const filter = {};
    if (from) filter.from = { $regex: from, $options: "i" }; // Case-insensitive search
    if (to) filter.to = { $regex: to, $options: "i" };
    if (date) {
      // Search for buses departing on the given date
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      filter.departureTime = { $gte: startOfDay, $lt: endOfDay };
    }

    const buses = await Bus.find(filter).populate("operatorId", "name").sort({ departureTime: 1 });
    res.json(buses);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET SINGLE BUS ---
router.get("/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("operatorId", "name");
    if (!bus) return res.status(404).json({ message: "Bus not found." });

    // Also get booked seats for this bus
    const bookings = await Booking.find({ busId: bus._id, status: "confirmed" });
    const bookedSeats = bookings.map((b) => b.seatNumber);

    res.json({ bus, bookedSeats });
  } catch (error) {
    console.error("Get bus error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET OPERATOR'S OWN BUSES ---
router.get("/operator/my", verifyToken, authorizeRoles("operator"), async (req, res) => {
  try {
    const buses = await Bus.find({ operatorId: req.user.id }).sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    console.error("Get operator buses error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- UPDATE A BUS ---
// Only the operator who owns the bus can update it
router.put("/:id", verifyToken, authorizeRoles("operator"), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found." });

    // Make sure the operator owns this bus
    if (bus.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own buses." });
    }

    // Update only the fields that were provided
    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      bus[key] = updates[key];
    });
    await bus.save();

    res.json({ message: "Bus updated successfully!", bus });
  } catch (error) {
    console.error("Update bus error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- DELETE A BUS ---
// Only the operator who owns the bus can delete it
router.delete("/:id", verifyToken, authorizeRoles("operator", "admin"), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found." });

    // Operators can only delete their own buses; admins can delete any
    if (req.user.role === "operator" && bus.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own buses." });
    }

    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: "Bus deleted successfully!" });
  } catch (error) {
    console.error("Delete bus error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
