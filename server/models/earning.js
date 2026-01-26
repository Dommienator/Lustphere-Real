const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  callId: { type: mongoose.Schema.Types.ObjectId, ref: "Call" },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["call", "gift", "withdrawal"], required: true },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Earning", earningSchema);
