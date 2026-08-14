const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      default: null,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    sosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOS",
      default: null,
    },

    // Used for normal location sharing
    sharing: {
      type: Boolean,
      default: false,
    },

    shareId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", locationSchema);