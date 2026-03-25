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

async function sendOTP (to, otp) {
    console.log(to);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Bus Booking OTP Verification",
    html: `
      <h3>Your OTP for booking</h3>
      <h2>${otp}</h2>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
};

module.exports = sendOTP;