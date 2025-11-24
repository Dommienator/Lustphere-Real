const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['caller', 'receiver'], required: true },
  tokens: { type: Number, default: 0 },
  location: { type: String, default: '' }, // NEW
  isOnline: { type: Boolean, default: false }, // NEW
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);