const express = require("express");
const mongoose = require( "mongoose");
const  cors = require( "cors");
const Bus = require( "./models/bus");
const Booking = require("./models/booking");
const Admin = require("./models/admin");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/busBooking")
  .then(async () => {console.log("MongoDB Connected");

  }
  )
  .catch(err => console.log(err));

/* End User API */

app.post("/bookSeat", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      busId,
      startStop,
      endStop,
      seatNumber,
      date
    } = req.body;

    
    if (
      !name || !email || !phone ||
      !busId || !startStop || !endStop ||
      !seatNumber || !date
    ) {
      console.log(req.body);
      return res.status(400).json({ message: "All fields are required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const stops = bus.routeStops;

    const startIndex = stops.indexOf(startStop);
    const endIndex = stops.indexOf(endStop);

    if (startIndex === -1 || endIndex === -1) {
      return res.status(400).json({ message: "Invalid stops selected" });
    }

    if (startIndex >= endIndex) {
      return res.status(400).json({
        message: "End stop must come after start stop"
      });
    }


    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    if (bus.disabledDates.includes(date)) {
      return res.status(400).json({
        message: "Bus not available on this date"
      });
    }

    if (bus.scheduleType === "SpecificDays") {
      if (!bus.daysOfWeek.includes(dayName)) {
        return res.status(400).json({
          message: "Bus does not run on this day"
        });
      }
    }

    if (bus.scheduleType === "SpecificDates") {
      if (!bus.specificDates.includes(date)) {
        return res.status(400).json({
          message: "Bus not scheduled on this date"
        });
      }
    }

    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return res.status(400).json({
        message: "Invalid seat number"
      });
    }


    const existingBookings = await Booking.find({
      busId,
      date,
      seatNumber,
      status: "Booked"
    });


    for (let booking of existingBookings) {
      const existingStartIndex = stops.indexOf(booking.startStop);
      const existingEndIndex = stops.indexOf(booking.endStop);

      const isConflict =
        (startIndex < existingEndIndex) &&
        (endIndex > existingStartIndex);

      if (isConflict) {
        return res.status(400).json({
          message: `Seat ${seatNumber} already booked for selected segment`
        });
      }
    }

    const totalStops = stops.length - 1;
    const segmentDistance = endIndex - startIndex;

    const price = Math.round(
      (segmentDistance / totalStops) * bus.basePrice
    );

    const booking = new Booking({
      name,
      email,
      phone,
      busId,
      startStop,
      endStop,
      seatNumber,
      date,
      price
    });

    await booking.save();


    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
});

app.get("/seatAvailability", async (req, res) => {
  try {
    const { busId, travelDate, startStop, endStop } = req.query;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const stops = bus.routeStops;

    const startIndex = stops.indexOf(startStop);
    const endIndex = stops.indexOf(endStop);

    const bookings = await Booking.find({
      busId,
      travelDate,
      status: "Booked"
    });

    let bookedSeats = [];

    for (let booking of bookings) {
      const existingStart = stops.indexOf(booking.startStop);
      const existingEnd = stops.indexOf(booking.endStop);

      const isConflict =
        (startIndex < existingEnd) &&
        (endIndex > existingStart);

      if (isConflict) {
        bookedSeats.push(booking.seatNumber);
      }
    }

    res.json({
      totalSeats: bus.totalSeats,
      bookedSeats
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch seats",
      error: error.message
    });
  }
});
app.get("/bus/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bus",
      error: error.message
    });
  }
});
/* Admin Side API  */

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", admin });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/addBus", async (req, res) => {
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
});

app.put("/editBus/:id", async (req, res) => {
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
});

app.delete("/deleteBus/:id", async (req, res) => {
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
});

app.get("/admin/buses", async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });

    res.json(buses);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buses",
      error: error.message
    });
  }
});

app.get("/admin/dashboard", async (req, res) => {
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
});

app.get("/admin/bookings", async (req, res) => {
  try {
    const { busId, date } = req.query;

    let filter = {};

    if (busId) filter.busId = busId;
    if (date) filter.travelDate = date;

    const bookings = await Booking.find(filter)
      .populate("busId")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
});

app.put("/admin/cancelBooking/:id", async (req, res) => {
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
});

app.get("/admin/bus/:id", async (req, res) => {
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
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
