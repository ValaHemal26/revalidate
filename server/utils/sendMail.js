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

async function sendMail(to, subject, htmlContent) {
  console.log(htmlContent);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Mail send error:", error);
    return false;
  }
}

async function sendOTP(to, otp, journey, type = "BOOKING") {
  let subject = "";
  let htmlContent = "";

  if (type === "TRACK") {
    subject = "Track Ticket OTP";
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>🔍 Track Your Booking</h2>
        <p>Your OTP for tracking ticket:</p>
        <h1 style="letter-spacing: 5px; color: #28a745;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;
  } else if (type === "AUTH") {
    subject = "Authentication Verification Code";
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>🔐 Welcome to Bus Booking</h2>
        <p>Your verification code for login/registration:</p>
        <h1 style="letter-spacing: 5px; color: #17a2b8;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `;
  } else if (type === "BOOKING_CONFIRMATION") {
    subject = "Bus Booking Confirmed!";
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>✅ Booking Confirmed</h2>
        <p>Your payment/verification was successful and your seat is confirmed.</p>
        <p><strong>PNR:</strong> ${journey.pnr}</p>
        <p><strong>Route:</strong> ${journey.source} → ${journey.destination}</p>
        <p><strong>Date:</strong> ${journey.date}</p>
        <p><strong>Seats:</strong> ${journey.seats.join(", ")}</p>
        <p>Thank you for choosing us.</p>
      </div>
    `;
  } else {
    // BOOKING VERIFICATION
    subject = "Bus Booking Verification Code";
    htmlContent = `
      <div style="font-family: Arial; padding: 10px;">
        <h2>🚌 Bus Booking Verification</h2>
        <p><strong>Name:</strong> ${journey.name}</p>
        <p><strong>Route:</strong> ${journey.source} → ${journey.destination}</p>
        <p><strong>Date:</strong> ${journey.date}</p>
        <p><strong>Seats:</strong> ${journey.seats.join(", ")}</p>
        <p><strong>Total Price:</strong> ₹${journey.totalPrice}</p>
        <hr />
        <h3>Your Verification Code</h3>
        <h1 style="letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>Enter this code to confirm your booking and mark payment as Paid.</p>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `;
  }

  return await sendMail(to, subject, htmlContent);
}

module.exports = {
  sendOTP,
  sendMail
};
