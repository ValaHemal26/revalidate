// ============================
// Booking Model
// ============================
// Defines the schema for bookings.
// Links a user to a bus with a specific seat number.

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Reference to the user who made the booking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the bus being booked
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    // The seat number the user booked (e.g., 1, 2, 3...)
    seatNumber: {
      type: Number,
      required: [true, "Seat number is required"],
      min: 1,
    },
    // Date when the booking was made
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    // Booking status
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking: same bus + same seat = unique
bookingSchema.index({ busId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
