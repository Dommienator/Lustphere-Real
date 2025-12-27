const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'model'], required: true },
  tokens: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  age: { type: Number },
  tagline: { type: String, default: '' },
  location: { type: String, default: '' },
  picture: { type: String, default: '👤' },
  paymentMethod: { type: String, default: 'mpesa' },
  isOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);