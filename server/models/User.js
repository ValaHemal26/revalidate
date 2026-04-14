// ============================
// User Model
// ============================
// Defines the schema for users in the database.
// Each user has a name, email, password (hashed), and a role.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    // User's email (must be unique)
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    // Hashed password (never store plain text passwords!)
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // Role determines what the user can do:
    // - "user": can search & book buses
    // - "operator": can add & manage buses
    // - "admin": can manage everything
    role: {
      type: String,
      enum: ["user", "operator", "admin"],
      default: "user",
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
