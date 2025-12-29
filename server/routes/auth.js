const express = require("express");
const router = express.Router();
const User = require("../models/User");
// ADD THIS AT THE TOP, right after const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

router.get("/test-db", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ message: "Database connected", userCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      nickname,
      email,
      password,
      role,
      age,
      tagline,
      location,
      picture,
      paymentMethod,
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      nickname,
      email,
      password,
      role, // accepts 'client' or 'model'
      age,
      tagline,
      location,
      picture,
      paymentMethod,
      tokens: role === "client" ? 100 : 0,
      totalEarned: role === "model" ? 0 : undefined,
      emailVerified: false,
    });

    await user.save();

    // If model, create their profile
    if (role === "model") {
      const Profile = require("../models/Profile");
      const profile = new Profile({
        userId: user._id,
        name,
        nickname,
        picture: picture || "👩",
        location,
        tagline,
        verified: false,
      });
      await profile.save();
    }

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("🔵 LOGIN ATTEMPT:", email, role);

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      console.log("❌ LOGIN FAILED: Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      console.log("❌ LOGIN FAILED: Wrong role");
      return res.status(400).json({ message: "Invalid role for this account" });
    }

    console.log("🟡 BEFORE SAVE - isOnline:", user.isOnline);

    user.isOnline = true;
    await user.save();

    console.log("🟢 AFTER SAVE - isOnline:", user.isOnline);

    // Verify it was actually saved
    const checkUser = await User.findById(user._id);
    console.log("✅ VERIFICATION CHECK - isOnline:", checkUser.isOnline);

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("💥 LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Logout
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("🔴 LOGOUT ATTEMPT:", userId);

    const user = await User.findById(userId);
    if (user) {
      console.log("🟡 BEFORE LOGOUT - isOnline:", user.isOnline);

      user.isOnline = false;
      await user.save();

      console.log("⚫ AFTER LOGOUT - isOnline:", user.isOnline);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("💥 LOGOUT ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;
