import mongoose from "mongoose";
import dotenv from "dotenv";
import Bus from "./models/bus.js";
import User from "./models/user.js";
import Booking from "./models/booking.js";

dotenv.config();

const SEED_BUSES = [
  {
    busName: "VRL Luxury Travels",
    busNumber: "KA-01-AB-1234",
    busType: "Sleeper",
    amenities: ["WiFi", "Blanket", "Water Bottle"],
    routeStops: ["Ahmedabad", "Vadodara", "Surat", "Mumbai"],
    departureTime: "18:00",
    arrivalTime: "06:00",
    totalSeats: 30,
    basePrice: 1500,
    scheduleType: "Daily",
    isActive: true
  },
  {
    busName: "Neeta Volvo AC",
    busNumber: "GJ-05-XY-9999",
    busType: "AC",
    amenities: ["AC", "Charging Point", "Reading Light"],
    routeStops: ["Surat", "Valsad", "Vapi", "Mumbai", "Pune"],
    departureTime: "22:00",
    arrivalTime: "05:00",
    totalSeats: 40,
    basePrice: 800,
    scheduleType: "Daily",
    isActive: true
  },
  {
    busName: "GSRTC Express",
    busNumber: "GJ-18-ZY-5555",
    busType: "Seater",
    amenities: [],
    routeStops: ["Ahmedabad", "Gandhinagar", "Mehsana", "Palanpur"],
    departureTime: "08:00",
    arrivalTime: "12:00",
    totalSeats: 50,
    basePrice: 200,
    scheduleType: "Daily",
    isActive: true
  },
  {
    busName: "Kallada Premium",
    busNumber: "KL-07-XX-7777",
    busType: "Sleeper",
    amenities: ["WiFi", "AC", "Snacks", "Wait Lounge"],
    routeStops: ["Mumbai", "Pune", "Bangalore"],
    departureTime: "16:00",
    arrivalTime: "10:00",
    totalSeats: 25,
    basePrice: 2500,
    scheduleType: "SpecificDays",
    daysOfWeek: ["Friday", "Saturday"],
    isActive: true
  },
  {
    busName: "Patel Tours & Travels",
    busNumber: "GJ-01-AB-1111",
    busType: "AC",
    amenities: ["AC", "Water Bottle"],
    routeStops: ["Rajkot", "Ahmedabad", "Vadodara", "Surat"],
    departureTime: "23:00",
    arrivalTime: "07:00",
    totalSeats: 36,
    basePrice: 1200,
    scheduleType: "Daily",
    isActive: true
  }
];

async function seedDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/busBooking");
    console.log("Connected to MongoDB...");

    // Clear old data
    console.log("Wiping collections...");
    await Bus.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});

    // Create Admin
    const admin = new User({
      name: "System Admin",
      email: "admin@busbooking.com",
      password: "admin", // Using simple plaintext password for demo/seed
      role: "ADMIN"
    });
    const operator = new User({
      name: "Default Operator",
      email: "operator@busbooking.com",
      password: "operator",
      role: "OPERATOR"
    });
    await admin.save();
    await operator.save();
    console.log("✅ Admin & Operator created.");

    // Seed Buses
    for (let bus of SEED_BUSES) {
      bus.operatorId = operator._id; // Assign to our default operator
      await new Bus(bus).save();
    }
    console.log("✅ 5 Premium Buses added.");

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDB();
