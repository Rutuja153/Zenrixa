const mongoose =
  require("mongoose");

const sosSchema =
  new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },

      status: {
        type: String,

        enum: [
          "ACTIVE",
          "CANCELLED",
          "COMPLETED",
        ],

        default: "ACTIVE",
      },

      startedAt: {
        type: Date,
        default: Date.now,
      },

      endedAt: {
        type: Date,
        default: null,
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SOS",
    sosSchema
  );