// ============================
// Main Server Entry Point
// ============================
// This file starts the Express server, connects to MongoDB,
// and registers all API routes.
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Load environment variables from .env file


// Connect to MongoDB
connectDB();

const app = express();

// --- Middleware ---
// Allow requests from React frontend (running on port 3000)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// Parse incoming JSON request bodies
app.use(express.json());

// --- API Routes ---
// Each route file handles a specific group of endpoints
app.use("/api/auth", require("./routes/auth"));       // Register & Login
app.use("/api/bus", require("./routes/bus"));           // Bus CRUD
app.use("/api/booking", require("./routes/booking"));   // Booking operations
app.use("/api/admin", require("./routes/admin"));       // Admin operations


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
});
