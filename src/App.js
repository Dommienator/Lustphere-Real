import React, { useState, useEffect, useRef } from 'react';
import { Phone, LogOut, Zap, PhoneOff, Gift, Heart, User } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function VideoDatingPlatform() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userTokens, setUserTokens] = useState(100);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: '', tagline: '' });
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTrack, setRemoteTrack] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  const pricingTiers = [
    { name: 'Starter', tokens: 10, price: 230, perToken: 23.00, savings: 0 },
    { name: 'Basic', tokens: 25, price: 550, perToken: 22.00, savings: 4 },
    { name: 'Popular', tokens: 50, price: 1050, perToken: 21.00, savings: 9 },
    { name: 'Pro', tokens: 100, price: 2000, perToken: 20.00, savings: 13 },
    { name: 'Elite', tokens: 200, price: 3800, perToken: 19.00, savings: 17 },
  ];

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userRole === 'receiver' && userId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/calls/check/${userId}`);
          const data = await response.json();
          if (data.hasCall) {
            setIncomingCall(data.call);
          }
        } catch (error) {
          console.error('Error polling for calls:', error);
        }
      }, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [isLoggedIn, userRole, userId]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profiles`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          tagline: form.tagline || '',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful! Now login.');
        setAuthMode('login');
        setForm({ ...form, password: '' });
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserRole(data.user.role);
        setUserId(data.user._id);
        setUserName(data.user.name);
        setUserTokens(data.user.tokens || 100);
        setIsLoggedIn(true);
        setShowAuthModal(false);
        fetchProfiles();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const getAgoraToken = async (channelName, uid) => {
    try {
      const response = await fetch(`${API_URL}/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });
      const data = await response.json();
      if (!data.token || !data.appId) {
        alert('Invalid token response from server');
        return null;
      }
      return { token: data.token, appId: data.appId };
    } catch (error) {
      console.error('Error getting Agora token:', error);
      return null;
    }
  };

  const handleStartCall = async (profile) => {
    if (!isLoggedIn) {
      alert('Please login to make a call');
      setShowAuthModal(true);
      return;
    }

    if (userRole !== 'caller') {
      alert('Only callers can initiate calls');
      return;
    }

    if (userTokens < 1) {
      alert('No tokens! Buy more.');
      return;
    }

    const receiverUserId = typeof profile.userId === 'object' ? profile.userId._id : profile.userId;
    const channelName = `call_${userId}_${receiverUserId}`;
    
    try {
      await fetch(`${API_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: userId,
          receiverId: receiverUserId,
          channelName: channelName,
        }),
      });
    } catch (error) {
      console.error('Error creating call notification:', error);
    }

    setActiveCall(profile);
    setInCall(true);

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

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          setRemoteTrack(user);
        }
      });

      client.on('user-unpublished', async (user) => {
        await client.unsubscribe(user);
        setRemoteTrack(null);
      });
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call. Error: ' + error.message);
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
      const uid = Math.floor(Math.random() * 100000);

      const tokenData = await getAgoraToken(incomingCall.channelName, uid);
      if (!tokenData) return;

      await client.join(tokenData.appId, incomingCall.channelName, tokenData.token, uid);

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalTrack({ videoTrack, audioTrack });
      await client.publish([videoTrack, audioTrack]);

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          setRemoteTrack(user);
        }
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call');
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;
    
    await fetch(`${API_URL}/calls/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: incomingCall.id }),
    });
    
    setIncomingCall(null);
  };

  const handleEndCall = async () => {
    try {
      if (localTrack) {
        localTrack.videoTrack?.close();
        localTrack.audioTrack?.close();
      }

      await client.leave();
      
      if (activeCall) {
        await fetch(`${API_URL}/calls/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: Date.now().toString() }),
        });
      }
      
      setActiveCall(null);
      setInCall(false);
      setLocalTrack(null);
      setRemoteTrack(null);
      setUserTokens(userTokens - 1);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleGiftTokens = (profile) => {
    setSelectedProfile(profile);
    setShowGiftModal(true);
  };

  const confirmGift = async (amount) => {
    if (userTokens < amount) {
      alert('Insufficient tokens!');
      return;
    }
    
    alert(`Gifted ${amount} tokens to ${selectedProfile.name}!`);
    setUserTokens(userTokens - amount);
    setShowGiftModal(false);
  };

  const profilesPerPage = 20;
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const startIdx = (currentPage - 1) * profilesPerPage;
  const displayedProfiles = profiles.slice(startIdx, startIdx + profilesPerPage);

  if (inCall && (activeCall || incomingCall)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center gap-4 p-4">
        <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-pink-500">
          <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800" />
        </div>

        <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500">
          <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800 flex items-center justify-center">
            <p className="text-white">{activeCall ? activeCall.name : 'Caller'}'s Camera</p>
          </div>
        </div>

        <div className="absolute bottom-8">
          <button onClick={handleEndCall} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2">
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">💜</div>
            <h1 className="text-3xl font-bold">LustSphere HD</h1>
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <User className="w-5 h-5" />
                <span className="font-semibold">{userName}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">{userTokens} Tokens</span>
              </div>
              <button onClick={() => { setIsLoggedIn(false); setShowAuthModal(false); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-semibold transition">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            💎 Token Packages - Better Value with More!
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-xl p-6 text-center hover:scale-105 transition cursor-pointer">
                <div className="text-4xl font-bold mb-2">{tier.tokens}</div>
                <div className="text-sm mb-2">Tokens</div>
                <div className="text-2xl font-bold mb-2">KSh {tier.price.toLocaleString()}</div>
                <div className="text-xs opacity-90 mb-2">KSh {tier.perToken}/token</div>
                {tier.savings > 0 && (
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-bold">
                    Save {tier.savings}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profiles Grid */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isLoggedIn && userRole === 'caller' ? 'Available Connections' : 'Meet Our Members'}
        </h2>

        {loading ? (
          <div className="text-center py-12"><p className="text-gray-600">Loading profiles...</p></div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg"><p className="text-gray-600">No profiles available yet</p></div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-6 mb-12">
              {displayedProfiles.map((profile) => (
                <div key={profile._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105">
                  <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-6 text-center relative">
                    <div className="text-7xl mb-2">{profile.picture}</div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Online
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{profile.name}</h3>
                    {profile.tagline && (
                      <p className="text-sm text-gray-600 italic mb-3">"{profile.tagline}"</p>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      {profile.bodyShape && <p><span className="font-semibold">Shape:</span> {profile.bodyShape}</p>}
                      {profile.personality && <p><span className="font-semibold">Vibe:</span> {profile.personality}</p>}
                    </div>

                    <div className="space-y-2">
                      <button onClick={() => handleStartCall(profile)} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        {isLoggedIn ? 'Call (1 Token)' : 'Login to Call'}
                      </button>
                      
                      {isLoggedIn && userRole === 'caller' && (
                        <button onClick={() => handleGiftTokens(profile)} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                          <Gift className="w-4 h-4" />
                          Gift Tokens
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 rounded-lg font-semibold transition ${page === currentPage ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setForm({ ...form, role: 'caller' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'caller' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-gray-200'}`}>
                Caller 📞
              </button>
              <button onClick={() => setForm({ ...form, role: 'receiver' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'receiver' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-gray-200'}`}>
                Receiver 💎
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
                  {form.role === 'receiver' && (
                    <input type="text" placeholder="Tagline (optional)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
                  )}
                </>
              )}
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
              <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" />
              <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-purple-600 font-semibold">
              {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Gift Tokens to {selectedProfile.name}</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[5, 10, 20].map(amount => (
                <button key={amount} onClick={() => confirmGift(amount)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition">
                  {amount} Tokens
                </button>
              ))}
            </div>
            <button onClick={() => setShowGiftModal(false)} className="text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Incoming Call for Receivers */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-2xl font-bold mb-4">Incoming Call</h3>
            <p className="text-gray-600 mb-8">Someone is calling you!</p>
            <div className="flex gap-4">
              <button onClick={handleAcceptCall} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold">
                Accept
              </button>
              <button onClick={handleRejectCall} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}