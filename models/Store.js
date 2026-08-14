const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isOpen: {
      type: Boolean,
      default: true
    },

    estimatedTime: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Store", storeSchema);