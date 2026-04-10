import Admin from "../models/admin.js";
import Booking  from "../models/booking.js";
import Bus from "../models/bus.js";
import jwt from "jsonwebtoken";

export async function  AdminLogin(req, res)  {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.json({ message: "Login successful", admin,token   });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


export async function AddBus(req, res)  {
  try {
    const data = req.body;

    // basic validation
    if (!data.busName || !data.busNumber || !data.routeStops) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bus = new Bus(data);
    await bus.save();

    res.status(201).json({
      message: "Bus added successfully",
      bus
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add bus",
      error: error.message
    });
  }
}

export  async function EditBus (req, res)  {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({
      message: "Bus updated",
      bus
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
}

export async function DeleteBus (req, res)  {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({ message: "Bus deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
}

export async function GetAllBuses (req, res)  {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });

    res.json(buses);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buses",
      error: error.message
    });
  }
}

export async function GetDashboard (req, res) {
  try {
    const totalBuses = await Bus.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const revenueData = await Booking.aggregate([
      { $match: { status: "Booked" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const revenue = revenueData[0]?.total || 0;

    const today = new Date().toISOString().split("T")[0];

    const todayBookings = await Booking.countDocuments({
      travelDate: today
    });

    res.json({
      totalBuses,
      totalBookings,
      revenue,
      todayBookings
    });

  } catch (error) {
    res.status(500).json({
      message: "Dashboard error",
      error: error.message
    });
  }
}

export  async function GetAllBookings (req, res) {
  try {
    
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
}

export  async function CancelBooking (req, res)  {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking cancelled",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: "Cancel failed",
      error: error.message
    });
  }
}

export async function GetBusByID (req, res)  {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bus",
      error: error.message,
    });
  }
}

export async function getCities(req, res) {
  const cities = await City.find().select("_id name").sort({ name: 1 });
  res.json(cities);
}

// GET /api/points/:cityId
export async function getPointsByCity(req, res) {
  const { cityId } = req.params;

  const points = await Point.find({ cityId })
    .select("_id name fullName")
    .sort({ name: 1 });

  res.json(points);
}