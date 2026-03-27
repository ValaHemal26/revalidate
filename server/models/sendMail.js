const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(to, otp, journey, type = "BOOKING") {
  let htmlContent = "";

  // ✅ TRACK TEMPLATE
  if (type === "TRACK") {
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>🔍 Track Your Booking</h2>
        <p>Your OTP for tracking ticket:</p>
        <h1 style="letter-spacing: 5px; color: #28a745;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;
  }

  // ✅ BOOKING TEMPLATE (your existing one)
  else {
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>🚌 Bus Booking Verification</h2>

        <p><strong>Name:</strong> ${journey.name}</p>
        <p><strong>Route:</strong> ${journey.source} → ${journey.destination}</p>
        <p><strong>Date:</strong> ${journey.date}</p>
        <p><strong>Seats:</strong> ${journey.seats.join(", ")}</p>
        <p><strong>Total Price:</strong> ₹${journey.totalPrice}</p>

        <hr />

        <h3>Your OTP</h3>
        <h1 style="letter-spacing: 5px; color: #007bff;">${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject:
      type === "TRACK"
        ? "Track Ticket OTP"
        : "Bus Booking OTP Verification",
    html: htmlContent,
  });
}

module.exports = sendOTP;