const express = require("express");
const mongoose = require( "mongoose");
const  cors = require( "cors");
const Bus = require( "./models/bus");
const Booking = require("./models/booking");
const Admin = require("./models/admin");
const jwt = require("jsonwebtoken");
const app = express();
const dotenv = require("dotenv");
const sendOTP = require("./models/sendMail");
const verifyAdminToken = require("./models/middleware");

dotenv.config();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/busBooking")
  .then(async () => {console.log("MongoDB Connected");

  }
  )
  .catch(err => console.log(err));

/* End User API */
app.get("/search-buses", async (req, res) => {
  try {
    const { source, destination, date } = req.query;

    if (!source || !destination || !date) {
      return res.status(400).json({ message: "Missing search params" });
    }

    const buses = await Bus.find();

    const result = [];

    for (let bus of buses) {
      const stops = bus.routeStops;

      const startIndex = stops.indexOf(source);
      const endIndex = stops.indexOf(destination);

      let status = "AVAILABLE";
      let reason = "";

      // ❌ Route invalid
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        status = "INVALID_ROUTE";
        reason = "Route not available";
      }

      const selectedDate = new Date(date);
      const dayName = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      // ❌ Disabled date
      if (bus.disabledDates.includes(date)) {
        status = "NOT_RUNNING";
        reason = "Bus not available on this date";
      }

      // ❌ Specific days
      if (
        bus.scheduleType === "SpecificDays" &&
        !bus.daysOfWeek.includes(dayName)
      ) {
        status = "NOT_RUNNING";
        reason = `Runs only on ${bus.daysOfWeek.join(", ")}`;
      }

      // ❌ Specific dates
      if (
        bus.scheduleType === "SpecificDates" &&
        !bus.specificDates.includes(date)
      ) {
        status = "NOT_RUNNING";
        reason = "Not scheduled on this date";
      }

      let availableSeats = 0;

      if (status === "AVAILABLE") {
        const bookings = await Booking.find({
          busId: bus._id,
          date,
          status: "Booked",
        });

        for (let seat = 1; seat <= bus.totalSeats; seat++) {
          let isBooked = false;

          for (let booking of bookings) {
            const existingStart = stops.indexOf(booking.startStop);
            const existingEnd = stops.indexOf(booking.endStop);

            const conflict =
              startIndex < existingEnd &&
              endIndex > existingStart;

            if (booking.seatNumber === seat && conflict) {
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
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err.message,
    });
  }
});
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
const otpStore = {};
app.post("/send-otp", async (req, res) => {
  const { email,journey } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await sendOTP(email, otp,journey);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
app.get("/buses", async (req, res) => {
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
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  
  const record = otpStore[email];
  console.log(record);
  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email];

  res.json({ success: true });
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
    
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.json({ message: "Login successful", admin,token   });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/addBus", verifyAdminToken, async (req, res) => {
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

app.put("/editBus/:id",verifyAdminToken, async (req, res) => {
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

app.delete("/deleteBus/:id",verifyAdminToken, async (req, res) => {
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

app.get("/admin/buses",verifyAdminToken, async (req, res) => {
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

app.get("/admin/dashboard",verifyAdminToken, async (req, res) => {
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

app.get("/admin/bookings",verifyAdminToken, async (req, res) => {
  try {
    
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
});

app.put("/admin/cancelBooking/:id",verifyAdminToken, async (req, res) => {
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

app.get("/admin/bus/:id",verifyAdminToken, async (req, res) => {
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
