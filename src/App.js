import React, { useState, useEffect, useRef } from 'react';
import { Phone, LogOut, Zap, PhoneOff } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function VideoDatingPlatform() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userTokens, setUserTokens] = useState(100);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: '' });
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTrack, setRemoteTrack] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

const API_URL = 'https://lustphere-real-1.onrender.com/api';
  // Poll for incoming calls (receiver only)
  useEffect(() => {
    if (isLoggedIn && userRole === 'receiver' && userId) {
      console.log('Polling for calls as receiver with userId:', userId);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/calls/check/${userId}`);
          const data = await response.json();
          
          console.log('Poll response:', data);
          
          if (data.hasCall) {
            console.log('Incoming call detected:', data.call);
            setIncomingCall(data.call);
          }
        } catch (error) {
          console.error('Error polling for calls:', error);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [isLoggedIn, userRole, userId]);

  // Fetch profiles
  useEffect(() => {
    if (isLoggedIn && userRole === 'caller') {
      fetchProfiles();
    }
  }, [isLoggedIn, userRole]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profiles`);
      const data = await response.json();
      console.log('Fetched profiles:', data);
      
      // Make sure data is an array
      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        console.error('Profiles is not an array:', data);
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
    }
    setLoading(false);
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      alert('Please fill all fields');
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
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful! Now login.');
        setForm({ email: '', password: '', name: '', role: '' });
        setIsSignupMode(false);
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
    }
  };

  // Handle Login
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
        console.log('Logged in user:', data.user);
        setUserRole(data.user.role);
        setUserId(data.user._id);
        setUserTokens(data.user.tokens || 100);
        setIsLoggedIn(true);
        setShowLoginModal(false);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  // Get Agora Token
  const getAgoraToken = async (channelName, uid) => {
    try {
      console.log('Requesting token for channel:', channelName, 'uid:', uid);
      const response = await fetch(`${API_URL}/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          uid,
        }),
      });
      const data = await response.json();
      console.log('Token response:', data);
      
      if (!data.token || !data.appId) {
        console.error('Missing token or appId in response:', data);
        alert('Invalid token response from server');
        return null;
      }
      
      return { token: data.token, appId: data.appId };
    } catch (error) {
      console.error('Error getting Agora token:', error);
      alert('Failed to get Agora token');
      return null;
    }
  };

  // Start Call with Agora
  const handleStartCall = async (profile) => {
    if (userTokens < 1) {
      alert('No tokens! Buy more.');
      return;
    }

    console.log('Starting call to profile:', profile);
    
    // Extract just the userId string (handle if it's an object or string)
    const receiverUserId = typeof profile.userId === 'object' ? profile.userId._id : profile.userId;
    const channelName = `call_${userId}_${receiverUserId}`;
    
    // Notify backend about the call
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
      console.log('Call notification sent to backend');
    } catch (error) {
      console.error('Error creating call notification:', error);
    }

    setActiveCall(profile);
    setInCall(true);

    const uid = Math.floor(Math.random() * 100000);

    try {
      const tokenData = await getAgoraToken(channelName, uid);
      if (!tokenData) {
        console.error('No token data received');
        setActiveCall(null);
        setInCall(false);
        return;
      }

      console.log('Joining channel with appId:', tokenData.appId);
      await client.join(tokenData.appId, channelName, tokenData.token, uid);
      console.log('Successfully joined channel');

      console.log('Creating local tracks...');
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log('Local tracks created');

      setLocalTrack({ videoTrack, audioTrack });

      await client.publish([videoTrack, audioTrack]);
      console.log('Tracks published');

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
        console.log('Local video playing');
      }

      client.on('user-published', async (user, mediaType) => {
        console.log('Remote user published:', user.uid, mediaType);
        await client.subscribe(user, mediaType);

        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
          setRemoteTrack(user);
          console.log('Remote video playing');
        }
      });

      client.on('user-unpublished', async (user) => {
        console.log('Remote user unpublished:', user.uid);
        await client.unsubscribe(user);
        setRemoteTrack(null);
      });
    } catch (error) {
      console.error('Error starting call:', error);
      console.error('Error details:', error.message, error.stack);
      alert('Failed to start call. Error: ' + error.message);
      setActiveCall(null);
      setInCall(false);
    }
  };

  // Accept incoming call (receiver)
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    console.log('Accepting call:', incomingCall);

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

  // Reject incoming call
  const handleRejectCall = async () => {
    if (!incomingCall) return;
    
    await fetch(`${API_URL}/calls/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: incomingCall.id }),
    });
    
    setIncomingCall(null);
  };

  // End Call
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

  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <Zap className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h1 className="text-4xl font-bold text-purple-600 mb-2">LustSphere HD</h1>
            <p className="text-gray-600">Premium Video Calls</p>
          </div>

          {!isSignupMode ? (
            <>
              <div className="mb-6 space-y-3">
                <button
                  onClick={() => setForm({ ...form, role: 'caller' })}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    form.role === 'caller'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Caller 📞
                </button>
                <button
                  onClick={() => setForm({ ...form, role: 'receiver' })}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    form.role === 'receiver'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Receiver 💎
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold"
                >
                  Login
                </button>
              </form>

              <button
                onClick={() => {
                  setIsSignupMode(true);
                  setForm({ email: '', password: '', name: '', role: '' });
                }}
                className="w-full mt-4 text-purple-600 font-semibold"
              >
                Need an account? Sign Up
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                <button
                  onClick={() => setForm({ ...form, role: 'caller' })}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                    form.role === 'caller'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Caller 📞
                </button>
                <button
                  onClick={() => setForm({ ...form, role: 'receiver' })}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                    form.role === 'receiver'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Receiver 💎
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold"
                >
                  Sign Up
                </button>
              </form>

              <button
                onClick={() => {
                  setIsSignupMode(false);
                  setForm({ email: '', password: '', name: '', role: '' });
                }}
                className="w-full mt-4 text-purple-600 font-semibold"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (inCall && (activeCall || incomingCall)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center gap-4 p-4">
        <div className="w-80 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-pink-500">
          <div
            ref={localVideoRef}
            style={{ width: '100%', height: '100%' }}
            className="bg-gray-800 flex items-center justify-center"
          >
            <p className="text-white text-center">Your Camera</p>
          </div>
        </div>

        <div className="w-80 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500">
          <div
            ref={remoteVideoRef}
            style={{ width: '100%', height: '100%' }}
            className="bg-gray-800 flex items-center justify-center"
          >
            <p className="text-white text-center">
              {activeCall ? activeCall.name : 'Caller'}'s Camera
            </p>
          </div>
        </div>

        <div className="absolute bottom-8">
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LustSphere HD</h1>
          <div className="flex items-center gap-6">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 inline mr-2" />
              {userTokens} Tokens
            </div>
            <button
              onClick={() => {
                setShowLoginModal(true);
                setIsLoggedIn(false);
                setForm({ email: '', password: '', name: '', role: '' });
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5 inline" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {userRole === 'caller' ? (
          <>
            <h2 className="text-3xl font-bold text-purple-600 mb-8">Available Receivers</h2>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : profiles.length === 0 ? (
              <p className="text-gray-600">No receivers available yet</p>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {profiles.map((profile) => (
                  <div key={profile._id} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition">
                    <div className="text-6xl mb-4">{profile.picture}</div>
                    <h3 className="text-xl font-bold mb-4">{profile.name}</h3>
                    <button
                      onClick={() => handleStartCall(profile)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call (1 Token)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-3xl font-bold mb-4">Receiver Dashboard</h2>
            <p className="text-gray-600 mb-4">Your profile is live! Waiting for calls...</p>
            <p className="text-sm text-gray-500">[Listening for incoming calls...]</p>
            
            {incomingCall && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
                  <div className="text-6xl mb-4">📞</div>
                  <h3 className="text-2xl font-bold mb-4">Incoming Call</h3>
                  <p className="text-gray-600 mb-8">Someone is calling you!</p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleAcceptCall}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleRejectCall}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}