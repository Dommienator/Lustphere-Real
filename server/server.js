require("dotenv").config();
console.log("AGORA_APP_ID:", process.env.AGORA_APP_ID);
console.log("AGORA_APP_CERTIFICATE:", process.env.AGORA_APP_CERTIFICATE);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ limit: "3mb", extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lustsphere")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Import Routes - ALL IMPORTS FIRST
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profiles");
const agoraRoutes = require("./routes/agora");
const callHistoryRoutes = require("./routes/calls");
const earningsRoutes = require("./routes/earnings");

// Use Routes - ALL app.use() AFTER IMPORTS
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/agora", agoraRoutes);
app.use("/api/calls", callHistoryRoutes);
app.use("/api/earnings", earningsRoutes);

// In-memory call store (temporary - should move to database)
global.activeCalls = [];

// Create call notification
app.post("/api/calls/create", (req, res) => {
  const { callerId, receiverId, channelName } = req.body;

  const call = {
    id: Date.now().toString(),
    callerId,
    receiverId,
    channelName,
    status: "pending",
    createdAt: new Date(),
  };

  global.activeCalls.push(call);
  console.log("✅ Call created:", call);

  res.json({ success: true, call });
});

// Check for incoming calls
app.get("/api/calls/check/:receiverId", (req, res) => {
  const { receiverId } = req.params;

  const incomingCall = global.activeCalls.find(
    (call) => call.receiverId === receiverId && call.status === "pending",
  );

  if (incomingCall) {
    res.json({ hasCall: true, call: incomingCall });
  } else {
    res.json({ hasCall: false });
  }
});

// Accept call
app.post("/api/calls/accept", (req, res) => {
  const { callId } = req.body;

  const call = global.activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = "active";
    console.log("✅ Call accepted:", callId);
  }

  res.json({ success: true });
});

// End call
app.post("/api/calls/end", (req, res) => {
  const { callId } = req.body;

  global.activeCalls = global.activeCalls.filter((c) => c.id !== callId);
  console.log("✅ Call ended:", callId);

  res.json({ success: true });
});

// Reject call
app.post("/api/calls/reject", (req, res) => {
  const { callId } = req.body;

  const callIndex = global.activeCalls.findIndex((c) => c.id === callId);

  if (callIndex !== -1) {
    const call = global.activeCalls[callIndex];
    global.activeCalls.splice(callIndex, 1);
    console.log("❌ Call rejected:", callId);
    res.json({ success: true, rejected: true, call });
  } else {
    res.json({ success: false, message: "Call not found" });
  }
});

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "🔥 LustSphere HD Backend Running" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
