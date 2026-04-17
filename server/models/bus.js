const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  busName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  busType: {
    type: String,
    enum: ["AC", "Non-AC", "Sleeper", "Seater"],
    default: "Seater"
  },
  amenities: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },

  routeStops: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, "At least 2 stops required"]
  },
  route: [
    {
      cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
      cityName: String,

      pickupPoints: [
        {
          pointId: { type: mongoose.Schema.Types.ObjectId, ref: "Point" },
          name: String
        }
      ],

      dropPoints: [
        {
          pointId: { type: mongoose.Schema.Types.ObjectId, ref: "Point" },
          name: String
        }
      ]
    }
  ],
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },

  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  
  seatLayout: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  basePrice: {
    type: Number,
    required: true,
    min: 0
  },

  scheduleType: {
    type: String,
    enum: ["Daily", "SpecificDays", "SpecificDates"],
    required: true
  },

  daysOfWeek: [String],       // ["Monday", "Saturday"]
  specificDates: [String],    // ["2026-03-20"]

  disabledDates: [String]     // Admin can disable bus on date
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);