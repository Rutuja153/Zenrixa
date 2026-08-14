const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
    },

    number: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);