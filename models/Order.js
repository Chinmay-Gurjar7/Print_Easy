const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    fileData: {
      type: Buffer,
      required: true
    },

    fileMimeType: {
      type: String,
      required: true
    },

    copies: {
      type: Number,
      default: 1
    },

    printType: {
      type: String,
      enum: ["black-white", "color"],
      default: "black-white"
    },

    sides: {
      type: String,
      enum: ["single", "double"],
      default: "single"
    },

    instructions: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "printing", "completed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);