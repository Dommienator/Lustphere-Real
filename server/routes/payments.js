const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mpesaService = require("../services/mpesa");
const paypalService = require("../services/paypal");

// ============ M-PESA ROUTES ============

// Initiate M-Pesa token purchase
router.post("/mpesa/purchase", async (req, res) => {
  try {
    const { userId, phoneNumber, amount, tokens } = req.body;

    if (!userId || !phoneNumber || !amount || !tokens) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const formattedPhone = phoneNumber.replace(/[\s+]/g, "");
    if (!formattedPhone.match(/^254\d{9}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Use 254XXXXXXXXX" });
    }

    const transaction = new Transaction({
      userId,
      type: "token_purchase",
      paymentMethod: "mpesa",
      amount,
      tokens,
      phoneNumber: formattedPhone,
      status: "pending",
    });
    await transaction.save();

    const mpesaResponse = await mpesaService.stkPush(
      formattedPhone,
      amount,
      `TOKENS_${transaction._id}`,
      `Purchase ${tokens} tokens`,
    );

    if (!mpesaResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = mpesaResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({ message: "M-Pesa request failed", error: mpesaResponse.error });
    }

    transaction.checkoutRequestID = mpesaResponse.CheckoutRequestID;
    transaction.merchantRequestID = mpesaResponse.MerchantRequestID;
    transaction.status = "processing";
    await transaction.save();

    res.json({
      success: true,
      message: "Payment initiated. Please check your phone.",
      transactionId: transaction._id,
      checkoutRequestID: mpesaResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error("M-Pesa purchase error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// M-Pesa STK Push callback
router.post("/mpesa/callback", async (req, res) => {
  try {
    console.log("📞 M-Pesa callback:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
      stkCallback;

    const transaction = await Transaction.findOne({
      checkoutRequestID: CheckoutRequestID,
    });

    if (!transaction) {
      console.error("Transaction not found:", CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (ResultCode === 0) {
      const receiptItem = CallbackMetadata.Item.find(
        (item) => item.Name === "MpesaReceiptNumber",
      );
      const mpesaReference = receiptItem ? receiptItem.Value : null;

      transaction.status = "completed";
      transaction.mpesaReference = mpesaReference;
      await transaction.save();

      const user = await User.findById(transaction.userId);
      user.tokens += transaction.tokens;
      await user.save();

      console.log(
        `✅ Payment successful. Credited ${transaction.tokens} tokens to ${user.email}`,
      );
    } else {
      transaction.status = "failed";
      transaction.failureReason = ResultDesc;
      await transaction.save();
      console.log(`❌ Payment failed: ${ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    res.json({ ResultCode: 1, ResultDesc: "Error" });
  }
});

// Initiate M-Pesa withdrawal
router.post("/mpesa/withdraw", async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "model") {
      return res.status(403).json({ message: "Only models can withdraw" });
    }

    if (user.totalEarned < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal is 100 KSh" });
    }

    const formattedPhone = phoneNumber.replace(/[\s+]/g, "");

    const transaction = new Transaction({
      userId,
      type: "withdrawal",
      paymentMethod: "mpesa",
      amount,
      phoneNumber: formattedPhone,
      status: "processing",
    });
    await transaction.save();

    const mpesaResponse = await mpesaService.b2c(
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

    user.totalEarned -= amount;
    await user.save();

    transaction.status = "completed";
    await transaction.save();

    res.json({
      success: true,
      message: "Withdrawal initiated. Money will arrive shortly.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("M-Pesa withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ============ PAYPAL ROUTES ============

// Initiate PayPal token purchase
router.post("/paypal/purchase", async (req, res) => {
  try {
    const { userId, amount, tokens } = req.body;

    if (!userId || !amount || !tokens) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const amountUSD = (amount / 130).toFixed(2); // Convert KSh to USD (rough rate)

    const transaction = new Transaction({
      userId,
      type: "token_purchase",
      paymentMethod: "paypal",
      amount,
      tokens,
      status: "pending",
    });
    await transaction.save();

    const paypalResponse = await paypalService.createOrder(amountUSD, "USD");

    if (!paypalResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = paypalResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({
          message: "PayPal request failed",
          error: paypalResponse.error,
        });
    }

    transaction.paypalOrderID = paypalResponse.orderID;
    transaction.status = "processing";
    await transaction.save();

    res.json({
      success: true,
      message: "PayPal order created",
      orderID: paypalResponse.orderID,
      approvalURL: paypalResponse.approvalURL,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("PayPal purchase error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Capture PayPal payment
router.post("/paypal/capture", async (req, res) => {
  try {
    const { orderID, transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const captureResponse = await paypalService.captureOrder(orderID);

    if (!captureResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = captureResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({
          message: "Payment capture failed",
          error: captureResponse.error,
        });
    }

    transaction.status = "completed";
    transaction.paypalPayerID = captureResponse.payerID;
    await transaction.save();

    const user = await User.findById(transaction.userId);
    user.tokens += transaction.tokens;
    await user.save();

    console.log(
      `✅ PayPal payment successful. Credited ${transaction.tokens} tokens to ${user.email}`,
    );

    res.json({
      success: true,
      message: "Payment successful",
      tokens: transaction.tokens,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Initiate PayPal withdrawal
router.post("/paypal/withdraw", async (req, res) => {
  try {
    const { userId, amount, paypalEmail } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "model") {
      return res.status(403).json({ message: "Only models can withdraw" });
    }

    if (user.totalEarned < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal is 500 KSh" });
    }

    const amountUSD = (amount / 130).toFixed(2);

    const transaction = new Transaction({
      userId,
      type: "withdrawal",
      paymentMethod: "paypal",
      amount,
      paypalEmail,
      status: "processing",
    });
    await transaction.save();

    const payoutResponse = await paypalService.createPayout(
      paypalEmail,
      amountUSD,
      "USD",
    );

    if (!payoutResponse.success) {
      transaction.status = "failed";
      transaction.failureReason = payoutResponse.error;
      await transaction.save();
      return res
        .status(500)
        .json({ message: "Payout failed", error: payoutResponse.error });
    }

    user.totalEarned -= amount;
    await user.save();

    transaction.status = "completed";
    transaction.paypalPayoutBatchID = payoutResponse.batchID;
    await transaction.save();

    res.json({
      success: true,
      message: "Payout initiated. Check your PayPal account.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("PayPal withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get transaction history
router.get("/history/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
