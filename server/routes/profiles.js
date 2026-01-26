const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");

// Get all receiver profiles (for callers to see)
router.get("/", async (req, res) => {
  try {
    // Populate userId to get isOnline status from User model
    const profiles = await Profile.find().populate(
      "userId",
      "name email nickname isOnline",
    );

    // Map profiles to include isOnline at root level for easier access
    const profilesWithStatus = profiles.map((profile) => ({
      _id: profile._id,
      name: profile.name,
      nickname: profile.userId?.nickname || profile.name,
      picture: profile.picture,
      age: profile.age,
      bodyShape: profile.bodyShape,
      personality: profile.personality,
      interests: profile.interests,
      verified: profile.verified,
      userId: profile.userId?._id,
      isOnline: profile.userId?.isOnline || false,
      location: profile.location,
      tagline: profile.tagline,
      createdAt: profile.createdAt,
    }));

    // Count how many are actually online
    const onlineCount = profilesWithStatus.filter((p) => p.isOnline).length;

    res.json({
      profiles: profilesWithStatus,
      onlineCount,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single profile
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("userId");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create profile (for receivers)
router.post("/", async (req, res) => {
  try {
    const { userId, name, age, bodyShape, personality, interests, image } =
      req.body;

    const profile = new Profile({
      userId,
      name,
      age,
      bodyShape,
      personality,
      interests,
      image,
    });

    await profile.save();
    res.status(201).json({ message: "Profile created", profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
