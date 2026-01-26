const express = require("express");
const router = express.Router();
const Earning = require("../models/Earning");
const User = require("../models/User");

// Get earnings history for a model
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const earnings = await Earning.find({ modelId: userId })
      .populate("callId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(earnings);
  } catch (error) {
    console.error("Earnings history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Withdraw earnings
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.totalEarned < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create withdrawal record
    const withdrawal = new Earning({
      modelId: userId,
      amount: -amount, // Negative for withdrawal
      type: "withdrawal",
      status: "pending",
    });
    await withdrawal.save();

    // Deduct from user's balance
    user.totalEarned -= amount;
    await user.save();

    res.json({ success: true, newBalance: user.totalEarned });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
