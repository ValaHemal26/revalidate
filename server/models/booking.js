const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,

  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true
  },

  startStop: String,
  endStop: String,

  seatNumber: Number,
  travelDate: String,

  price: Number,

  status: {
    type: String,
    enum: ["Booked", "Cancelled"],
    default: "Booked"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);