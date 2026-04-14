// ============================
// Bus Model
// ============================
// Defines the schema for buses in the database.
// Each bus is linked to an operator (user with role "operator").

const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    // Name or number of the bus (e.g., "Express 101")
    busName: {
      type: String,
      required: [true, "Bus name is required"],
      trim: true,
      maxlength: 100,
    },
    // Reference to the operator who owns this bus
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Departure city
    from: {
      type: String,
      required: [true, "Departure city is required"],
      trim: true,
      maxlength: 100,
    },
    // Destination city
    to: {
      type: String,
      required: [true, "Destination city is required"],
      trim: true,
      maxlength: 100,
    },
    // When the bus leaves
    departureTime: {
      type: Date,
      required: [true, "Departure time is required"],
    },
    // When the bus arrives
    arrivalTime: {
      type: Date,
      required: [true, "Arrival time is required"],
    },
    // Total number of seats on the bus
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
      max: 100,
    },
    // Price per seat in your currency
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);
