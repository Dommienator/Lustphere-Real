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
    paymentMethod: {
      type: String,
      enum: ["mpesa", "paypal"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    paypalEmail: {
      type: String,
      default: null,
    },
    // M-Pesa fields
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
    // PayPal fields
    paypalOrderID: {
      type: String,
      default: null,
    },
    paypalPayerID: {
      type: String,
      default: null,
    },
    paypalPayoutBatchID: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    failureReason: {
      type: String,
      default: null,
    },
    reconciledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
