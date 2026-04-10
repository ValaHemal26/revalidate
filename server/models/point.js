const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    redbusPointId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },

    redbusCityId: {
      type: Number,
      index: true,
    },

    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Point", pointSchema);