const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    relation: {
      type: String,
      default: "Emergency Contact",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Faster user contact lookup
contactSchema.index({
  userId: 1,
  createdAt: -1,
});

// Prevent same phone from being added twice
// for the same user
contactSchema.index(
  {
    userId: 1,
    phone: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Contact",
  contactSchema
);