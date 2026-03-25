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

async function sendOTP(to, otp, journey) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Bus Booking OTP Verification",
    html: `
      <div style="font-family: Arial; padding: 10px;">
        <h2 style="color: #333;">🚌 Bus Booking Verification</h2>

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
    `,
  });
}

module.exports = sendOTP;