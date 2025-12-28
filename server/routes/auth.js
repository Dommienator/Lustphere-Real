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
        isOnline: true,
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

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: "Invalid role for this account" });
    }
    user.isOnline = true;
    await user.save();
    // Also update profile if model
    if (user.role === "model") {
      const Profile = require("../models/Profile");
      await Profile.findOneAndUpdate({ userId: user._id }, { isOnline: true });
    }
    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.isOnline = false;
      await user.save();

      // Update profile if model
      if (user.role === "model") {
        const Profile = require("../models/Profile");
        await Profile.findOneAndUpdate(
          { userId: user._id },
          { isOnline: false }
        );
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
