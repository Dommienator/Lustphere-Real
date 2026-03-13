const express = require("express");
const router = express.Router();
const { initiateSTKPush, sendMoneyToModel } = require("../services/mpesa");
const {
  sendTokenPurchaseReceipt,
  sendWithdrawalConfirmation,
} = require("../services/email");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Initiate token purchase
router.post("/purchase-tokens", async (req, res) => {
  try {
    const { userId, phoneNumber, amount, tokens } = req.body;

    // Validate
    if (!userId || !phoneNumber || !amount || !tokens) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = phoneNumber.replace(/[\s+]/g, "");
    if (!formattedPhone.match(/^254\d{9}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number format. Use 254XXXXXXXXX" });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: "token_purchase",
      amount,
      tokens,
      phoneNumber: formattedPhone,
      status: "pending",
    });
    await transaction.save();

    // Initiate STK Push
    const mpesaResponse = await initiateSTKPush(
      formattedPhone,
      amount,
      `TOKENS_${transaction._id}`,
    );

    if (!mpesaResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = mpesaResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({ message: "M-Pesa request failed", error: mpesaResponse.error });
    }

    // Update transaction with M-Pesa IDs
    transaction.checkoutRequestID = mpesaResponse.checkoutRequestID;
    transaction.merchantRequestID = mpesaResponse.merchantRequestID;
    await transaction.save();

    res.json({
      message: "Payment initiated. Please check your phone.",
      transactionId: transaction._id,
      checkoutRequestID: mpesaResponse.checkoutRequestID,
    });
  } catch (error) {
    console.error("Purchase tokens error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// M-Pesa callback (STK Push result)
router.post("/callback", async (req, res) => {
  try {
    console.log(
      "📞 M-Pesa callback received:",
      JSON.stringify(req.body, null, 2),
    );

    const { Body } = req.body;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find transaction
    const transaction = await Transaction.findOne({
      checkoutRequestID: CheckoutRequestID,
    });
    if (!transaction) {
      console.error("❌ Transaction not found:", CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: "Transaction not found" });
    }

    // Success
    if (ResultCode === 0) {
      // Extract M-Pesa receipt number
      const receiptItem = CallbackMetadata.Item.find(
        (item) => item.Name === "MpesaReceiptNumber",
      );
      const mpesaReference = receiptItem ? receiptItem.Value : null;

      transaction.status = "completed";
      transaction.mpesaReference = mpesaReference;
      await transaction.save();

      // Credit user tokens
      const user = await User.findById(transaction.userId);
      user.tokens += transaction.tokens;
      await user.save();

      console.log(
        `✅ Payment successful. Credited ${transaction.tokens} tokens to user ${user.email}`,
      );

      // Send receipt email
      await sendTokenPurchaseReceipt(
        user.email,
        user.name,
        transaction.tokens,
        transaction.amount,
        mpesaReference,
      );
    } else {
      // Failed
      transaction.status = "failed";
      transaction.failureReason = ResultDesc;
      await transaction.save();

      console.log(`❌ Payment failed: ${ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Callback error:", error);
    res.json({ ResultCode: 1, ResultDesc: "Error processing callback" });
  }
});

// Initiate withdrawal (model cashes out)
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;

    // Validate
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "model") {
      return res.status(403).json({ message: "Only models can withdraw" });
    }

    if (user.totalEarned < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal is 100 KSh" });
    }

    // Format phone
    const formattedPhone = phoneNumber.replace(/[\s+]/g, "");
    if (!formattedPhone.match(/^254\d{9}$/)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      type: "withdrawal",
      amount,
      phoneNumber: formattedPhone,
      status: "pending",
    });
    await transaction.save();

    // Send money via B2C
    const mpesaResponse = await sendMoneyToModel(
      formattedPhone,
      amount,
      `LustSphere Earnings - ${user.name}`,
    );

    if (!mpesaResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = mpesaResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({ message: "Withdrawal failed", error: mpesaResponse.error });
    }

    transaction.conversationID = mpesaResponse.conversationID;
    await transaction.save();

    // Deduct from user balance (optimistic - before confirmation)
    user.totalEarned -= amount;
    await user.save();

    res.json({
      message: "Withdrawal initiated. You will receive money shortly.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get transaction history
router.get("/history/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
