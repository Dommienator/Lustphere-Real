// PART 1: Imports, State, and Logic Functions
// Copy this entire file and paste it at the top of your App.js

import React, { useState, useEffect, useRef } from 'react';
import { Phone, LogOut, Zap, PhoneOff, Gift, User, MapPin, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
const TOKEN_TO_KSH = 23;
const API_URL = 'http://localhost:5000/api';

export default function VideoDatingPlatform() {
  // ============ STATE MANAGEMENT ============
  const [currentPage, setCurrentPage] = useState(1);
  const [userTokens, setUserTokens] = useState(100);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [profiles, setProfiles] = useState([]);
  const [onlineCount, setOnlineCount] = useState({ clients: 0, models: 0 });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Form state
  const [form, setForm] = useState({ 
    email: '', password: '', confirmPassword: '', name: '', nickname: '', role: '', 
    age: '', tagline: '', location: '', picturePreview: null, agreedToTerms: false, paymentMethod: 'mpesa'
  });
  
  // Modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showModelProfile, setShowModelProfile] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [showTokenPurchase, setShowTokenPurchase] = useState(false);
  const [selectedTokenPackage, setSelectedTokenPackage] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showEarningsHistory, setShowEarningsHistory] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  
  // Call states
  const [localTrack, setLocalTrack] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);

  const pricingTiers = [
    { tokens: 10, price: 230, perToken: 23, savings: 0 },
    { tokens: 25, price: 550, perToken: 22, savings: 4 },
    { tokens: 50, price: 1050, perToken: 21, savings: 9 },
    { tokens: 100, price: 2000, perToken: 20, savings: 13 },
    { tokens: 200, price: 3800, perToken: 19, savings: 17 },
  ];

  // ============ UTILITY FUNCTIONS ============
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  // ============ EFFECTS ============
  useEffect(() => {
    fetchProfiles();
    if (isLoggedIn && userId) {
      fetchCallHistory();
      if (userRole === 'model') fetchEarningsHistory();
    }
  }, [isLoggedIn, userId, userRole]);

  useEffect(() => {
    if (isLoggedIn && userRole === 'model' && userId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/calls/check/${userId}`);
          const data = await response.json();
          if (data.hasCall) setIncomingCall(data.call);
        } catch (error) {
          console.error('Error polling:', error);
        }
      }, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [isLoggedIn, userRole, userId]);

  useEffect(() => {
    if (inCall && userRole === 'client') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration > 0 && newDuration % 30 === 0) {
            if (userTokens > 0) {
              setUserTokens(t => t - 1);
            } else {
              showNotification('Out of tokens! Call ending...', 'error');
              handleEndCall();
            }
          }
          return newDuration;
        });
      }, 1000);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [inCall, userRole, userTokens]);

  // ============ FETCH FUNCTIONS ============
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profiles`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const online = data.filter(p => p.isOnline).sort(() => Math.random() - 0.5);
        const offline = data.filter(p => !p.isOnline).sort(() => Math.random() - 0.5);
        setProfiles([...online, ...offline]);
        setOnlineCount({ models: online.length, clients: Math.floor(Math.random() * 50) + 20 });
      } else setProfiles([]);
    } catch (error) { setProfiles([]); }
    setLoading(false);
  };

  const fetchCallHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/calls/history/${userId}`);
      const data = await response.json();
      if (response.ok) setCallHistory(data.calls || []);
    } catch (error) { console.error('Error fetching call history:', error); }
  };

  const fetchEarningsHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/earnings/history/${userId}`);
      const data = await response.json();
      if (response.ok) setEarningsHistory(data.earnings || []);
    } catch (error) { console.error('Error fetching earnings history:', error); }
  };

  // ============ AUTH HANDLERS ============
  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, picturePreview: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!form.agreedToTerms) return showNotification('Please agree to terms of service', 'error');
    if (form.age && parseInt(form.age) < 18) return showNotification('You must be 18 or older to sign up', 'error');

    const passwordError = validatePassword(form.password);
    if (passwordError) return showNotification(passwordError, 'error');
    if (form.password !== form.confirmPassword) return showNotification('Passwords do not match', 'error');

    if (form.role === 'client' && (!form.email || !form.nickname)) {
      return showNotification('Please enter your email and nickname', 'error');
    }
    if (form.role === 'model' && (!form.name || !form.nickname || !form.email || !form.password || !form.age || !form.location || !form.picturePreview)) {
      return showNotification('Please fill all required fields', 'error');
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || 'Client',
          nickname: form.nickname,
          email: form.email,
          password: form.password,
          role: form.role,
          age: form.age || null,
          tagline: form.tagline || '',
          location: form.location || '',
          picture: form.picturePreview || '👤',
          paymentMethod: 'mpesa', // Default, can be changed later
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('✨ Signup successful! Check your email to verify.', 'success');
        setShowVerificationModal(true);
        setShowAuthModal(false);
      } else {
        showNotification(data.message || 'Signup failed. Please try again.', 'error');
        console.error('Signup error response:', data);
      }
    } catch (error) {
      showNotification('Network error. Please check connection.', 'error');
      console.error('Signup network error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.agreedToTerms) return showNotification('Please agree to terms of service', 'error');
    if (!form.email || !form.role || !form.password) return showNotification('Please fill all fields', 'error');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, role: form.role }),
      });
      const data = await response.json();
      if (response.ok) {
        if (!data.user.emailVerified) {
          showNotification('Please verify your email before logging in', 'error');
          setShowVerificationModal(true);
          return;
        }
        setUserRole(data.user.role);
        setUserId(data.user._id);
        setUserName(data.user.name);
        setUserNickname(data.user.nickname);
        setUserTokens(data.user.tokens || 100);
        setTotalEarned(data.user.totalEarned || 0);
        setIsLoggedIn(true);
        setShowAuthModal(false);
        showNotification(`💜 Welcome back, ${data.user.nickname || data.user.name}!`, 'success');
        fetchProfiles();
        fetchCallHistory();
        if (data.user.role === 'model') fetchEarningsHistory();
      } else {
        showNotification(data.message || 'Login failed.', 'error');
      }
    } catch (error) {
      showNotification('Login failed. Check connection.', 'error');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('✅ Email verified! You can now login.', 'success');
        setShowVerificationModal(false);
        setAuthMode('login');
      } else showNotification(data.message || 'Verification failed', 'error');
    } catch (error) { showNotification('Verification failed', 'error'); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nickname: form.nickname,
          tagline: form.tagline,
          picture: form.picturePreview,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('✅ Profile updated!', 'success');
        setUserNickname(form.nickname);
        setShowProfileEdit(false);
        setShowModelProfile(false);
        fetchProfiles();
      } else showNotification(data.message || 'Update failed', 'error');
    } catch (error) { showNotification('Update failed', 'error'); }
  };

  const handlePaymentMethodUpdate = async (method) => {
    try {
      const response = await fetch(`${API_URL}/profile/payment-method`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, paymentMethod: method }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('✅ Payment method updated!', 'success');
        setForm({ ...form, paymentMethod: method });
        setShowPaymentSetup(false);
      } else showNotification(data.message || 'Update failed', 'error');
    } catch (error) { showNotification('Update failed', 'error'); }
  };

  // ============ TOKEN & PAYMENT HANDLERS ============
  const handleTokenPurchase = (tier) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setSelectedTokenPackage(tier);
    setShowTokenPurchase(true);
  };

  const confirmTokenPurchase = async () => {
    if (!mpesaNumber || mpesaNumber.length < 10) {
      return showNotification('Enter valid M-Pesa number', 'error');
    }
    
    try {
      const response = await fetch(`${API_URL}/tokens/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, tokens: selectedTokenPackage.tokens,
          amount: selectedTokenPackage.price, mpesaNumber,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(`✅ Purchase initiated! Check ${mpesaNumber}`, 'success');
        setShowTokenPurchase(false);
        setMpesaNumber('');
      } else showNotification(data.message || 'Purchase failed', 'error');
    } catch (error) { showNotification('Purchase failed', 'error'); }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return showNotification('Enter valid amount', 'error');
    if (amount > totalEarned) return showNotification('Insufficient balance', 'error');
    
    try {
      const response = await fetch(`${API_URL}/earnings/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(`💰 Withdrawal of KSh ${amount} initiated!`, 'success');
        setTotalEarned(totalEarned - amount);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchEarningsHistory();
      } else showNotification(data.message || 'Withdrawal failed', 'error');
    } catch (error) { showNotification('Withdrawal failed', 'error'); }
  };

  const handleGiftTokens = async (amount) => {
    if (userTokens < amount) return showNotification('Insufficient tokens!', 'error');
    showNotification(`💝 Gifted ${amount} tokens!`, 'success');
    setUserTokens(userTokens - amount);
    setShowGiftModal(false);
  };

  // ============ CALL HANDLERS ============
  const getAgoraToken = async (channelName, uid) => {
    try {
      const response = await fetch(`${API_URL}/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });
      const data = await response.json();
      if (!data.token || !data.appId) return null;
      return { token: data.token, appId: data.appId };
    } catch (error) { return null; }
  };

  const handleStartCall = async (profile) => {
    if (!isLoggedIn) {
      showNotification('Please login to make a call', 'error');
      setShowAuthModal(true);
      return;
    }
    if (userRole !== 'client') return showNotification('Only clients can initiate calls', 'error');
    if (userTokens < 1) return showNotification('No tokens! Please purchase more.', 'error');

    setPendingProfile(profile);
    setShowSafetyWarning(true);
  };

  const confirmCall = async () => {
    setShowSafetyWarning(false);
    const profile = pendingProfile;

    const receiverUserId = typeof profile.userId === 'object' ? profile.userId._id : profile.userId;
    const channelName = `call_${userId}_${receiverUserId}`;
    
    try {
      await fetch(`${API_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: userId, receiverId: receiverUserId, channelName }),
      });
    } catch (error) { console.error('Error creating call:', error); }

    setActiveCall(profile);
    setInCall(true);
    setCallDuration(0);
    const uid = Math.floor(Math.random() * 100000);

    try {
      const tokenData = await getAgoraToken(channelName, uid);
      if (!tokenData) {
        setActiveCall(null);
        setInCall(false);
        return;
      }

      await client.join(tokenData.appId, channelName, tokenData.token, uid);
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalTrack({ videoTrack, audioTrack });
      await client.publish([videoTrack, audioTrack]);

      if (localVideoRef.current) videoTrack.play(localVideoRef.current);

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      });
    } catch (error) {
      showNotification('Failed to start call: ' + error.message, 'error');
      setActiveCall(null);
      setInCall(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      await fetch(`${API_URL}/calls/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: incomingCall.id }),
      });

      setInCall(true);
      setCallDuration(0);
      const uid = Math.floor(Math.random() * 100000);
      const tokenData = await getAgoraToken(incomingCall.channelName, uid);
      if (!tokenData) return;

      await client.join(tokenData.appId, incomingCall.channelName, tokenData.token, uid);
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalTrack({ videoTrack, audioTrack });
      await client.publish([videoTrack, audioTrack]);

      if (localVideoRef.current) videoTrack.play(localVideoRef.current);

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      });

      setIncomingCall(null);
    } catch (error) { showNotification('Failed to accept call', 'error'); }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;
    await fetch(`${API_URL}/calls/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: incomingCall.id }),
    });
    setIncomingCall(null);
    showNotification('Call declined', 'success');
  };

  const handleEndCall = async () => {
    try {
      if (localTrack) {
        localTrack.videoTrack?.close();
        localTrack.audioTrack?.close();
      }
      await client.leave();
      
      const tokensUsed = Math.ceil(callDuration / 30);
      if (userRole === 'model') {
        const earnedKsh = tokensUsed * TOKEN_TO_KSH;
        setTotalEarned(prev => prev + earnedKsh);
        showNotification(`💰 Earned KSh ${earnedKsh}!`, 'success');
      }

      setActiveCall(null);
      setInCall(false);
      setLocalTrack(null);
      setCallDuration(0);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      fetchCallHistory();
    } catch (error) { console.error('Error ending call:', error); }
  };

  // Pagination
  const profilesPerPage = 20;
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const startIdx = (currentPage - 1) * profilesPerPage;
  const displayedProfiles = profiles.slice(startIdx, startIdx + profilesPerPage);

  // ============ RENDER STARTS IN PART 2 ============
  // Continue to Part 2 for the JSX/UI rendering
  // PART 2: UI Rendering - Paste this AFTER Part 1
// This continues from where Part 1 ended (after the displayedProfiles calculation)

  // ============ RENDER: CALL SCREEN ============
  if (inCall) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 p-4 flex justify-between items-center">
          <div className="text-white">
            <div className="text-xl font-bold">{activeCall?.name || 'Call'}</div>
            <div className="text-sm opacity-90">Duration: {formatTime(callDuration)}</div>
          </div>
          <div className="flex items-center gap-4">
            {userRole === 'client' && (
              <>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold">
                  <Zap className="w-4 h-4 inline mr-1" /> {userTokens}
                </div>
                <button onClick={() => setShowGiftModal(true)} className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Gift
                </button>
              </>
            )}
            {userRole === 'model' && (
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold">
                💰 Earning: KSh {Math.ceil(callDuration / 30) * TOKEN_TO_KSH}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-4 p-4">
          <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-pink-400">
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800" />
          </div>
          <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-400">
            <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800" />
          </div>
        </div>

        <div className="p-4 flex justify-center">
          <button onClick={handleEndCall} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-semibold flex items-center gap-2">
            <PhoneOff className="w-6 h-6" /> End Call
          </button>
        </div>

        {showGiftModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Send a Gift</h2>
              <p className="text-gray-600 mb-6">To {activeCall?.name}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[5, 10, 20].map(amount => (
                  <button key={amount} onClick={() => handleGiftTokens(amount)} className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-4 rounded-lg font-bold hover:scale-105 transition">
                    {amount} Tokens<br /><span className="text-sm opacity-90">KSh {amount * TOKEN_TO_KSH}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowGiftModal(false)} className="text-gray-600 hover:text-gray-800">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ RENDER: MAIN APP SCREEN ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-pink-600 to-purple-700'} text-white`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="text-4xl">💜</div>
            <h1 className="text-3xl font-bold">LustSphere HD</h1>
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4 flex-wrap text-sm">
              {userRole === 'client' ? (
                <>
                  <button onClick={() => setShowProfileEdit(true)} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">{userNickname || userName}</span>
                  </button>
                  <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold">{userTokens} Tokens</span>
                  </div>
                  <button onClick={() => setShowCallHistory(true)} className="hover:underline">Call History</button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowModelProfile(true)} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">{userNickname || userName}</span>
                  </button>
                  <button onClick={() => setShowPaymentSetup(true)} className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-opacity-30">
                    <span className="font-semibold">💰 KSh {totalEarned.toLocaleString()}</span>
                  </button>
                  <div className="bg-white bg-opacity-20 px-3 py-2 rounded-full text-xs">
                    <span>👥 {onlineCount.clients} clients • 💎 {onlineCount.models} models online</span>
                  </div>
                </>
              )}
              <button onClick={() => { setIsLoggedIn(false); setShowAuthModal(false); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-semibold">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Model Dashboard */}
      {userRole === 'model' ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Model Dashboard</h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
            <div className="text-5xl font-bold text-purple-600 mb-2">KSh {totalEarned.toLocaleString()}</div>
            <p className="text-gray-600 mb-6">Total Earned</p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{onlineCount.clients}</div>
                <div className="text-sm text-gray-600">Clients Online</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{onlineCount.models}</div>
                <div className="text-sm text-gray-600">Models Online</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Token Packages */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💎 Token Packages - 1 Token = KSh 23
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {pricingTiers.map((tier, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleTokenPurchase(tier)}
                  className="bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-xl p-6 text-center hover:scale-105 transition cursor-pointer"
                >
                  <div className="text-4xl font-bold mb-2">{tier.tokens}</div>
                  <div className="text-sm mb-2 opacity-90">Tokens</div>
                  <div className="text-2xl font-bold mb-2">KSh {tier.price.toLocaleString()}</div>
                  <div className="text-xs opacity-80 mb-2">KSh {tier.perToken}/token</div>
                  {tier.savings > 0 && (
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-bold">
                      Save {tier.savings}%
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Models List */}
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isLoggedIn ? 'Available Models' : 'Meet Our Models'}
          </h2>

          {loading ? (
            <div className="text-center py-12"><p>Loading...</p></div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg"><p>No models available</p></div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-6 mb-12">
                {displayedProfiles.map((profile) => (
                  <div key={profile._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105">
                    <div className="bg-gradient-to-br from-pink-300 to-purple-400 p-6 text-center relative">
                      {profile.picture && profile.picture.startsWith('data:') ? (
                        <img src={profile.picture} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white object-cover" />
                      ) : (
                        <div className="text-7xl">{profile.picture}</div>
                      )}
                      <div className={`absolute top-2 right-2 flex items-center gap-1 ${profile.isOnline ? 'bg-pink-500' : 'bg-gray-400'} text-white text-xs px-2 py-1 rounded-full`}>
                        <div className={`w-2 h-2 bg-white rounded-full ${profile.isOnline ? 'animate-pulse' : ''}`} />
                        {profile.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{profile.name}</h3>
                      {profile.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" /> {profile.location}
                        </p>
                      )}
                      {profile.tagline && (
                        <p className="text-sm text-gray-600 italic mb-3">"{profile.tagline}"</p>
                      )}

                      <button onClick={() => handleStartCall(profile)} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        {isLoggedIn ? 'Video Call' : 'Login to Call'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 rounded-lg font-semibold ${page === currentPage ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white text-gray-700'}`}>
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== ALL MODALS ========== */}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setForm({ ...form, role: 'client' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'client' ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white' : 'bg-gray-200'}`}>
                Client 👤
              </button>
              <button onClick={() => setForm({ ...form, role: 'model' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'model' ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white' : 'bg-gray-200'}`}>
                Model 💎
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  {form.role === 'model' && (
                    <>
                      <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="text" placeholder="Nickname *" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="number" placeholder="Age (18+) *" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min="18" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-500 transition">
                        <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" id="pic" />
                        <label htmlFor="pic" className="cursor-pointer">
                          {form.picturePreview ? (
                            <img src={form.picturePreview} alt="Preview" className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-4 border-pink-300" />
                          ) : (
                            <Upload className="w-10 h-10 mx-auto text-pink-400 mb-2" />
                          )}
                          <p className="text-sm text-gray-600">{form.picturePreview ? 'Change Photo' : 'Upload Photo *'}</p>
                        </label>
                      </div>
                      
                      <input type="text" placeholder="Location (City, Country) *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="text" placeholder="Tagline (optional)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                      
                      <input type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 special) *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="password" placeholder="Enter password again *" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                    </>
                  )}
                  {form.role === 'client' && (
                    <>
                      <input type="text" placeholder="Nickname *" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 special) *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                      
                      <input type="password" placeholder="Enter password again *" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                    </>
                  )}
                </>
              )}
              
              <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
              
              {authMode === 'login' && (
                <input type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
              )}
              
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })} className="mt-1" required />
                <span>I confirm I am 18 years or older and agree to the <span className="text-purple-600 font-semibold">Terms of Service</span> and <span className="text-purple-600 font-semibold">Privacy Policy</span></span>
              </label>
              
              <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-purple-600 font-semibold hover:text-purple-700">
              {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
              <p className="text-gray-600">We've sent a verification code to {form.email}</p>
            </div>
            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-2xl tracking-widest mb-4"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowVerificationModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                Cancel
              </button>
              <button onClick={handleVerifyEmail} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full my-8">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Edit Profile</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nickname" 
                value={form.nickname} 
                onChange={(e) => setForm({ ...form, nickname: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              
              <input 
                type="text" 
                placeholder="Tagline" 
                value={form.tagline} 
                onChange={(e) => setForm({ ...form, tagline: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              
              {userRole === 'model' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Location" 
                    value={form.location} 
                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-500 transition">
                    <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" id="pic-edit" />
                    <label htmlFor="pic-edit" className="cursor-pointer">
                      {form.picturePreview ? (
                        <img src={form.picturePreview} alt="Preview" className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-4 border-pink-300" />
                      ) : (
                        <Upload className="w-12 h-12 mx-auto text-pink-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-600">{form.picturePreview ? 'Change Photo' : 'Upload New Photo'}</p>
                    </label>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowProfileEdit(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Purchase Modal */}
      {showTokenPurchase && selectedTokenPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <Zap className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Purchase Tokens</h3>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-xl mb-6 text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">{selectedTokenPackage.tokens} Tokens</div>
              <div className="text-2xl font-bold text-purple-600">KSh {selectedTokenPackage.price.toLocaleString()}</div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter M-Pesa Number</label>
              <input 
                type="tel" 
                placeholder="0712345678" 
                value={mpesaNumber} 
                onChange={(e) => setMpesaNumber(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 mt-2">You'll receive an M-Pesa prompt on this number</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => { setShowTokenPurchase(false); setMpesaNumber(''); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                Cancel
              </button>
              <button onClick={confirmTokenPurchase} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Earnings Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-6xl text-center mb-4">💰</div>
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Withdraw Earnings</h3>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-xl mb-6 text-center">
              <div className="text-sm text-gray-600 mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-purple-600">KSh {totalEarned.toLocaleString()}</div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Withdraw (KSh)</label>
              <input 
                type="number" 
                placeholder="Enter amount" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value)} 
                max={totalEarned}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 mt-2">Funds will be sent to your registered payment method</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                Cancel
              </button>
              <button onClick={handleWithdraw} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Call History</h3>
              <button onClick={() => setShowCallHistory(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            
            {callHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No call history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {callHistory.map((call, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{call.modelName || 'Model'}</div>
                      <div className="text-sm text-gray-600">{new Date(call.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{call.duration} min</div>
                      <div className="text-sm text-gray-600">{call.tokens} tokens</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Earnings History Modal */}
      {showEarningsHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Earnings History</h3>
              <button onClick={() => setShowEarningsHistory(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            
            {earningsHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">💰</div>
                <p>No earnings history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earningsHistory.map((earning, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{earning.type === 'call' ? '📞 Call Earnings' : '💸 Withdrawal'}</div>
                      <div className="text-sm text-gray-600">{new Date(earning.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${earning.type === 'call' ? 'text-green-600' : 'text-red-600'}`}>
                        {earning.type === 'call' ? '+' : '-'} KSh {earning.amount.toLocaleString()}
                      </div>
                      {earning.type === 'call' && (
                        <div className="text-sm text-gray-600">{earning.duration} min call</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Warning Modal */}
      {showSafetyWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-pink-500" />
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Safety First</h3>
            <div className="text-gray-700 space-y-3 mb-6">
              <p className="font-semibold">⚠️ Important Safety Guidelines:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Never agree to meet strangers in person</li>
                <li>Keep all interactions within the platform</li>
                <li>Do not share personal information</li>
                <li>Report any inappropriate behavior</li>
                <li>Stay safe and respectful</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSafetyWarning(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                Cancel
              </button>
              <button onClick={confirmCall} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call for Models */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Incoming Call</h3>
            <p className="text-gray-600 mb-8">A client is calling you!</p>
            <div className="flex gap-4">
              <button onClick={handleAcceptCall} className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-semibold">
                Accept
              </button>
              <button onClick={handleRejectCall} className="flex-1 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-semibold">
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// END OF PART 2 - This closes the component and export