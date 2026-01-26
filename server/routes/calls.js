const express = require("express");
const router = express.Router();
const Call = require("../models/Call");

// Get call history for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .populate("callerId", "name nickname")
      .populate("receiverId", "name nickname")
      .sort({ startedAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (error) {
    console.error("Call history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Save completed call
router.post("/save", async (req, res) => {
  try {
    const { callerId, receiverId, duration, tokensUsed, amountKsh, status } =
      req.body;

    const call = new Call({
      callerId,
      receiverId,
      duration,
      tokensUsed,
      amountKsh,
      status: status || "completed",
      endedAt: new Date(),
    });

    await call.save();

    // Also create earning record for model
    if (status === "completed" && amountKsh > 0) {
      const Earning = require("../models/Earning");
      const earning = new Earning({
        modelId: receiverId,
        callId: call._id,
        amount: amountKsh,
        type: "call",
      });
      await earning.save();
    }

    res.json({ success: true, call });
  } catch (error) {
    console.error("Save call error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
