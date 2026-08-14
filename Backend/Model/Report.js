const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    userName: {
      type: String,
      default: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Safety Issue",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    fileUrl: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Review",
        "Resolved",
      ],
      default: "Pending",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Report",
  reportSchema
);