const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  duration: { type: Number, required: true }, // in seconds
  tokensUsed: { type: Number, required: true },
  amountKsh: { type: Number, required: true },
  status: {
    type: String,
    enum: ["completed", "rejected", "missed"],
    default: "completed",
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

module.exports = mongoose.model("Call", callSchema);
