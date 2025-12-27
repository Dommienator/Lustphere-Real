const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'model'], required: true },
  age: { type: Number },
  tagline: { type: String, default: '' },
  location: { type: String, default: '' },
  picture: { type: String, default: '👤' },
  paymentMethod: { type: String, enum: ['mpesa', 'paypal', 'card'], default: 'mpesa' },
  tokens: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);