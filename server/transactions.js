const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["token_purchase", "withdrawal"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tokens: {
      type: Number, // Only for token purchases
      default: 0,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    mpesaReference: {
      type: String,
      default: null,
    },
    checkoutRequestID: {
      type: String,
      default: null,
    },
    merchantRequestID: {
      type: String,
      default: null,
    },
    conversationID: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transaction", transactionSchema);
