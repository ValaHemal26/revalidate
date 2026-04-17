import Bus from "../models/bus.js";
import Booking from "../models/booking.js";
import User from "../models/user.js";
import City from "../models/city.js";
import Point from "../models/point.js";

// ==================== DASHBOARD ====================
export async function AdminDashboard(req, res) {
  try {
    // Check if admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();

    const bookedBookings = await Booking.find({
      status: { $in: ["Booked", "confirmed", "Verified"] },
    });
    const totalRevenue = bookedBookings.reduce(
      (sum, b) => sum + (b.price || 0),
      0,
    );

    const pendingBookings = await Booking.countDocuments({
      status: { $in: ["PendingVerification", "pending"] },
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "Cancelled",
    });

    res.status(200).json({
      totalBuses,
      activeBuses,
      totalBookings,
      totalRevenue,
      pendingBookings,
      cancelledBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ==================== BUSES - ADMIN VIEW ====================
export async function AdminGetAllBuses(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const buses = await Bus.find()
      .populate("operatorId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminGetBusById(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bus = await Bus.findById(req.params.id).populate(
      "operatorId",
      "name email",
    );
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminCreateBus(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const newBus = new Bus({
      ...req.body,
      operatorId: req.user.id,
      isActive: true,
    });

    await newBus.save();
    res.status(201).json(newBus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminUpdateBus(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminDeleteBus(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ==================== BOOKINGS - ADMIN VIEW ====================
export async function AdminGetAllBookings(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bookings = await Booking.find()
      .populate("busId", "busName busNumber")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminCancelBooking(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ==================== USERS / OPERATORS MANAGEMENT ====================
export async function AdminGetAllOperators(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const operators = await User.find({ role: "OPERATOR" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(operators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminGetAllUsers(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminApproveOperator(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { action } = req.body; // "approve" or "reject"

    if (action === "approve") {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true },
      ).select("-password");

      res.status(200).json({ message: "Operator approved", user });
    } else if (action === "reject") {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true },
      ).select("-password");

      res.status(200).json({ message: "Operator rejected", user });
    } else {
      res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminBlockUser(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User blocked", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminUnblockUser(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User unblocked", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ==================== ADMIN PROFILE ====================
export async function AdminGetProfile(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    console.log("Admin ID from token:", req.user.userId); // Debugging line
    const admin = await User.findById(req.user.userId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminUpdateProfile(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    console.log("Admin ID from token:", req.user); // Debugging line
    const { name, email, phone } = req.body;

    const admin = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, phone },
      { new: true },
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Profile updated", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ==================== PENDING LOCATIONS (Operator Requests) ====================
export async function AdminGetPendingLocations(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const pendingCities = await City.find({ status: "PENDING" }).sort({
      createdAt: -1,
    });

    const pendingPoints = await Point.find({ status: "PENDING" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      pendingCities,
      pendingPoints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function AdminApproveLoc(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { type, action } = req.body; // type: "city" or "point", action: "approve" or "reject"
    const { id } = req.params;

    let document;

    if (type === "city") {
      document = await City.findByIdAndUpdate(
        id,
        { status: action === "approve" ? "APPROVED" : "REJECTED" },
        { new: true },
      );
    } else if (type === "point") {
      document = await Point.findByIdAndUpdate(
        id,
        { status: action === "approve" ? "APPROVED" : "REJECTED" },
        { new: true },
      );
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    if (!document) {
      return res.status(404).json({ message: `${type} not found` });
    }

    res.status(200).json({ message: `${type} ${action}d`, document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
