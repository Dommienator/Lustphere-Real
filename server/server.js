require('dotenv').config();
console.log('AGORA_APP_ID:', process.env.AGORA_APP_ID);
console.log('AGORA_APP_CERTIFICATE:', process.env.AGORA_APP_CERTIFICATE);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lustsphere')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const agoraRoutes = require('./routes/agora');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/agora', agoraRoutes);

// In-memory call store (in production, use Redis or database)
global.activeCalls = [];

// Create call notification
app.post('/api/calls/create', (req, res) => {
  const { callerId, receiverId, channelName } = req.body;
  
  const call = {
    id: Date.now().toString(),
    callerId,
    receiverId,
    channelName,
    status: 'pending',
    createdAt: new Date(),
  };
  
  global.activeCalls.push(call);
  console.log('Call created:', call);
  
  res.json({ success: true, call });
});

// Check for incoming calls (receiver polls this)
app.get('/api/calls/check/:receiverId', (req, res) => {
  const { receiverId } = req.params;
  
  const incomingCall = global.activeCalls.find(
    call => call.receiverId === receiverId && call.status === 'pending'
  );
  
  if (incomingCall) {
    console.log('Incoming call found for receiver:', receiverId);
    res.json({ hasCall: true, call: incomingCall });
  } else {
    res.json({ hasCall: false });
  }
});

// Accept call
app.post('/api/calls/accept', (req, res) => {
  const { callId } = req.body;
  
  const call = global.activeCalls.find(c => c.id === callId);
  if (call) {
    call.status = 'active';
    console.log('Call accepted:', callId);
  }
  
  res.json({ success: true });
});

// End call
app.post('/api/calls/end', (req, res) => {
  const { callId } = req.body;
  
  global.activeCalls = global.activeCalls.filter(c => c.id !== callId);
  console.log('Call ended:', callId);
  
  res.json({ success: true });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: '🔥 LustSphere HD Backend Running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});