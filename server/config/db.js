// ============================
// MongoDB Connection
// ============================
// This file connects to MongoDB using Mongoose.
// The connection string comes from the .env file.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Exit the process if DB connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
