const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: "bus-secret",
  resave: false,
  saveUninitialized: true,
}));

/* ================= DB CONNECT ================= */

mongoose.connect("mongodb://127.0.0.1:27017/bus-reservation")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= SCHEMAS ================= */

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const busSchema = new mongoose.Schema({
  name: String,

  from: String,
  to: String,

  departureTime: String, // "08:30 AM"
  arrivalTime: String,   // "02:00 PM"

  journeyDate: String,   // "2026-03-20"

  price: Number,
  seats: Number,

  // 🛣 ROUTES (stops)
  stops: [
    {
      city: String,
      arrival: String,
      departure: String,
    }
  ],
});

const bookingSchema = new mongoose.Schema({
  ticketId: String,
  passengerName: String,
  busId: String,
  busName: String,
  from: String,
  to: String,
  status: {
    type: String,
    default: "BOOKED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);
const Bus = mongoose.model("Bus", busSchema);
const Booking = mongoose.model("Booking", bookingSchema);

/* ======================================================
   🔐 ADMIN AUTH (DB BASED)
====================================================== */



app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username, password });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.adminId = admin._id;

    res.json({ message: "✅ Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});


/* 🚪 LOGOUT */
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

/* 🔒 CHECK AUTH */
const isAdminAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

/* ======================================================
   🛠 ADMIN APIs (PROTECTED)
====================================================== */

/* ➕ ADD BUS */
app.post("/admin/bus", isAdminAuth, async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.json({ message: "Bus added", bus });
  } catch {
    res.status(500).json({ message: "Add failed" });
  }
});
// GET SINGLE BUS
app.get("/admin/bus/:id", async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  console.log(bus);
  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json(bus);
});
/* 📋 GET ALL BUSES */
app.get("/admin/buses", isAdminAuth, async (req, res) => {
  const buses = await Bus.find();
  res.json(buses);
});

/* ✏️ UPDATE BUS */
app.put("/admin/bus/:id", isAdminAuth, async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json({ message: "Updated", bus });
});

/* 🗑 DELETE BUS */
app.delete("/admin/bus/:id", isAdminAuth, async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json({ message: "Deleted" });
});

/* 📊 VIEW BOOKINGS */
app.get("/admin/bookings", isAdminAuth, async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

/* ======================================================
   👤 USER APIs
====================================================== */

/* 🔍 SEARCH BUS */
app.get("/buses/search", async (req, res) => {
  const { from, to } = req.query;

  const buses = await Bus.find({
    from: new RegExp(from, "i"),
    to: new RegExp(to, "i"),
  });

  if (buses.length === 0) {
    return res.status(404).json({
      message: "No buses found",
    });
  }

  res.json(buses);
});

/* 🎫 BOOK */
app.post("/book", async (req, res) => {
  const { passengerName, busId } = req.body;

  const bus = await Bus.findById(busId);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  if (bus.seats <= 0) {
    return res.status(400).json({ message: "No seats available" });
  }

  const ticketId = Date.now().toString();

  const booking = new Booking({
    ticketId,
    passengerName,
    busId,
    busName: bus.name,
    from: bus.from,
    to: bus.to,
  });

  await booking.save();

  bus.seats -= 1;
  await bus.save();

  res.json({ message: "Booked", ticketId });
});

/* 🎯 TRACK */
app.get("/ticket/:id", async (req, res) => {
  const ticket = await Booking.findOne({ ticketId: req.params.id });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  res.json(ticket);
});

/* ❌ CANCEL */
app.post("/cancel/:id", async (req, res) => {
  const ticket = await Booking.findOne({ ticketId: req.params.id });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.status === "CANCELLED") {
    return res.status(400).json({ message: "Already cancelled" });
  }

  ticket.status = "CANCELLED";
  await ticket.save();

  const bus = await Bus.findById(ticket.busId);
  if (bus) {
    bus.seats += 1;
    await bus.save();
  }

  res.json({ message: "Cancelled" });
});

/* ====================================================== */

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});