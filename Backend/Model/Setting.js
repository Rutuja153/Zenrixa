const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    autoStartLocation: { type: Boolean, default: false },
    language: { type: String, default: "English" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
