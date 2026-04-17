const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

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

  verificationCode: String,
  verificationCodeExpires: Date,

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Refunded"],
    default: "Pending"
  },

  status: {
    type: String,
    enum: ["PendingVerification", "Booked", "Cancelled"],
    default: "PendingVerification"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);