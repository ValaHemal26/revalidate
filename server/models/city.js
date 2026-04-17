const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    redbusCityId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    normalizedName: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: "GJ",
    },
    status: {
      type: String,
      enum: ["APPROVED", "PENDING", "REJECTED"],
      default: "APPROVED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("City", citySchema);
