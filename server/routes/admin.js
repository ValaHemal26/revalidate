// ============================
// Admin Routes
// ============================
// GET    /api/admin/users       - View all users
// GET    /api/admin/buses       - View all buses
// GET    /api/admin/bookings    - View all bookings
// DELETE /api/admin/user/:id    - Delete a user
// DELETE /api/admin/bus/:id     - Delete a bus

const express = require("express");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Booking = require("../models/Booking");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, authorizeRoles("admin"));

// --- GET ALL USERS ---
router.get("/users", async (req, res) => {
  try {
    // Don't return passwords!
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET ALL BUSES ---
router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find().populate("operatorId", "name email").sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    console.error("Admin get buses error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET ALL BOOKINGS ---
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("busId", "busName from to")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Admin get bookings error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- DELETE A USER ---
router.delete("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- DELETE A BUS ---
router.delete("/bus/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found." });

    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: "Bus deleted successfully!" });
  } catch (error) {
    console.error("Admin delete bus error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- GET DASHBOARD STATS ---
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalOperators = await User.countDocuments({ role: "operator" });

    res.json({ totalUsers, totalBuses, totalBookings, totalOperators });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
