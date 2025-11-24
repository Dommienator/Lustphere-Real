const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      tokens: role === 'receiver' ? 0 : 100,
    });

    await user.save();

    // If receiver, automatically create their profile
    if (role === 'receiver') {
      const Profile = require('../models/Profile');
      const profile = new Profile({
        userId: user._id,
        name,
        picture: '👩',
        verified: false,
      });
      await profile.save();
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: 'Invalid role for this account' });
    }

    user.isOnline = true;
    await user.save();

    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (user) {
      user.isOnline = false;
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;