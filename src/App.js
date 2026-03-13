import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// Utils & Services
import { TOKEN_TO_KSH, API_URL } from "./utils/constants";
import { getAgoraToken } from "./services/agora";
import { callAPI } from "./services/api";

// Hooks
import { useNotifications } from "./hooks/useNotifications";
import { useAuth } from "./hooks/useAuth";
import { useProfiles } from "./hooks/useProfiles";
import { useCallManagement } from "./hooks/useCallManagement";

// Components
import { Notification } from "./components/Notification";
import { Header } from "./components/Header";
import { CallScreen } from "./components/CallScreen";
import { ModelDashboard } from "./components/ModelDashboard";
import { ProfileGrid } from "./components/ProfileGrid";

// Modals
import { AuthModal } from "./components/modals/AuthModal";
import { VerificationModal } from "./components/modals/VerificationModal";
import { ProfileEditModal } from "./components/modals/ProfileEditModal";
import { ModelProfileModal } from "./components/modals/ModelProfileModal";
import { PaymentSetupModal } from "./components/modals/PaymentSetupModal";
import { TokenPurchaseModal } from "./components/modals/TokenPurchaseModal";
import { WithdrawModal } from "./components/modals/WithdrawModal";
import { CallHistoryModal } from "./components/modals/CallHistoryModal";
import { EarningsHistoryModal } from "./components/modals/EarningsHistoryModal";
import { SafetyWarningModal } from "./components/modals/SafetyWarningModal";
import { IncomingCallModal } from "./components/modals/IncomingCallModal";
import { GiftModal } from "./components/modals/GiftModal";
import { CallEndedModal } from "./components/modals/CallEndedModal";
import { ViewModelProfileModal } from "./components/modals/ViewModelProfileModal";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function VideoDatingPlatform() {
  // Notifications
  const { notification, showNotification } = useNotifications();

  // Profiles
  const {
    profiles,
    onlineCount,
    loading,
    fetchProfiles,
    updateProfile,
    updatePaymentMethod,
  } = useProfiles();

  // Call Management
  const {
    callHistory,
    earningsHistory,
    fetchCallHistory,
    fetchEarningsHistory,
    purchaseTokens,
    withdrawEarnings,
  } = useCallManagement();

  // Auth
  const auth = useAuth(
    showNotification,
    fetchProfiles,
    fetchCallHistory,
    fetchEarningsHistory,
  );

  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showModelProfile, setShowModelProfile] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [showTokenPurchase, setShowTokenPurchase] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showEarningsHistory, setShowEarningsHistory] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showCallEndedModal, setShowCallEndedModal] = useState(false);
  const [callEndedData, setCallEndedData] = useState(null);
  const [showViewModelProfile, setShowViewModelProfile] = useState(false);
  const [selectedModelProfile, setSelectedModelProfile] = useState(null);

  // Form State
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    role: "",
    age: "",
    tagline: "",
    location: "",
    picturePreview: null,
    extraPictures: [],
    agreedToTerms: false,
    ageConfirmed: false,
    paymentMethod: "mpesa",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedTokenPackage, setSelectedTokenPackage] = useState(null);
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Call State
  const [activeCall, setActiveCall] = useState(null);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [callStatus, setCallStatus] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const declinedRef = useRef(false);

  // Effects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (auth.isLoggedIn && auth.userId) {
      fetchCallHistory(auth.userId);
      if (auth.userRole === "model") {
        fetchEarningsHistory(auth.userId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLoggedIn, auth.userId, auth.userRole]);

  useEffect(() => {
    if (auth.isLoggedIn && auth.userRole === "model" && auth.userId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await callAPI.checkIncoming(auth.userId);
          const data = await response.json();
          if (data.hasCall) setIncomingCall(data.call);
        } catch (error) {
          console.error("Error polling:", error);
        }
      }, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [auth.isLoggedIn, auth.userRole, auth.userId]);

  // POLL FOR CALL STATUS (CLIENT SIDE)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (
      auth.isLoggedIn &&
      auth.userRole === "client" &&
      callStatus === "ringing" &&
      activeCall
    ) {
      const statusPollInterval = setInterval(async () => {
        try {
          const receiverUserId =
            typeof activeCall.userId === "object"
              ? activeCall.userId._id
              : activeCall.userId;
          const response = await fetch(
            `${API_URL}/calls/status/${auth.userId}/${receiverUserId}`,
          );
          const data = await response.json();

          if (data.status === "declined") {
            clearInterval(statusPollInterval);
            declinedRef.current = true;

            if (localTrack) {
              if (localTrack.videoTrack) {
                localTrack.videoTrack.stop();
                localTrack.videoTrack.close();
              }
              if (localTrack.audioTrack) {
                localTrack.audioTrack.stop();
                localTrack.audioTrack.close();
              }
              setLocalTrack(null);
            }

            try {
              await client.leave();
            } catch (err) {
              console.log("Already left channel");
            }

            setActiveCall(null);
            setCallStatus(null);
            setCallEndedData({ status: "declined", isModel: false });
            setShowCallEndedModal(true);
          }
        } catch (error) {
          console.error("Error checking call status:", error);
        }
      }, 2000);

      return () => clearInterval(statusPollInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    auth.isLoggedIn,
    auth.userRole,
    callStatus,
    activeCall,
    auth.userId,
    localTrack,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (inCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          const newDuration = prev + 1;

          // Deduct tokens PER SECOND for clients (1 token = 60 seconds)
          if (auth.userRole === "client" && newDuration > 0) {
            // Calculate tokens used (1 token per 60 seconds)
            const tokensNeeded = Math.ceil(newDuration / 60);
            const currentTokensUsed = Math.ceil(prev / 60);

            // Deduct 1 token every 60 seconds
            if (tokensNeeded > currentTokensUsed) {
              if (auth.userTokens > 0) {
                auth.setUserTokens((t) => t - 1);
              } else {
                showNotification("Out of tokens! Call ending...", "error");
                handleEndCall();
              }
            }
          }

          return newDuration;
        });
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [inCall, auth.userRole]);

  // Persist login on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      auth.setUserId(userData.userId);
      auth.setUserRole(userData.role);
      auth.setUserName(userData.name);
      auth.setUserNickname(userData.nickname);
      auth.setUserEmail(userData.email);
      auth.setUserAge(userData.age);
      auth.setUserLocation(userData.location);
      auth.setUserTokens(userData.tokens);
      auth.setTotalEarned(userData.totalEarned);
      auth.setIsLoggedIn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm({ ...form, picturePreview: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.agreedToTerms)
      return showNotification("Please agree to terms", "error");
    if (!form.ageConfirmed)
      return showNotification("Please confirm you are 18+", "error");
    if (form.age && parseInt(form.age) < 18)
      return showNotification("Must be 18+", "error");

    const result = await auth.signup(form);
    if (result.success) {
      showNotification("✨ Signup successful! You can now login.", "success");
      setShowAuthModal(false);
      setAuthMode("login");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.ageConfirmed)
      return showNotification("Please confirm you are 18+", "error");

    const result = await auth.login(form);
    if (result.success) {
      setShowAuthModal(false);
    } else if (result.needsVerification) {
      setShowVerificationModal(true);
    }
  };

  const handleVerifyEmail = async () => {
    const result = await auth.verifyEmail(form.email, verificationCode);
    if (result.success) {
      setShowVerificationModal(false);
      setAuthMode("login");
    }
  };

  const handleOpenProfileEdit = async () => {
    // Fetch current profile data for client
    try {
      const response = await fetch(`${API_URL}/profiles/user/${auth.userId}`);
      const data = await response.json();

      if (data.profile) {
        setForm({
          ...form,
          name: auth.userName || "",
          nickname: data.profile.nickname || auth.userNickname || "",
          location: data.profile.location || auth.userLocation || "",
          picturePreview: data.profile.picture || null,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setShowProfileEdit(true);
  };

  const handleOpenModelProfile = async () => {
    // Fetch current profile data for model
    try {
      const response = await fetch(`${API_URL}/profiles/user/${auth.userId}`);
      const data = await response.json();

      if (data.profile) {
        setForm({
          ...form,
          name: auth.userName || "",
          nickname: data.profile.nickname || auth.userNickname || "",
          picturePreview: data.profile.picture || null,
          extraPictures: data.profile.extraPictures || [],
          location: data.profile.location || "",
          tagline: data.profile.tagline || "",
          age: data.profile.age || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setShowModelProfile(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const result = await updateProfile(
      auth.userId,
      {
        name: form.name,
        nickname: form.nickname,
        tagline: form.tagline,
        location: form.location,
        picture: form.picturePreview,
        extraPictures: form.extraPictures || [],
      },
      showNotification,
    );

    if (result.success) {
      auth.setUserName(form.name);
      auth.setUserNickname(form.nickname);
      auth.setUserLocation(form.location);
      setShowProfileEdit(false);
      setShowModelProfile(false);

      // Show success notification
      showNotification("✅ Profile updated successfully!", "success");

      // Refresh profiles
      fetchProfiles();

      // Return to homepage (scroll to top)
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showNotification("❌ Failed to update profile", "error");
    }
  };

  const handlePaymentMethodChange = async (method) => {
    const result = await updatePaymentMethod(
      auth.userId,
      method,
      showNotification,
    );
    if (result.success) {
      setForm({ ...form, paymentMethod: method });
      setShowPaymentSetup(false);
    }
  };

  const handleTokenPurchase = (tier) => {
    if (!auth.isLoggedIn) {
      setShowAuthModal(true);
      setAuthMode("login");
      return;
    }
    setSelectedTokenPackage(tier);
    setShowTokenPurchase(true);
  };

  const confirmTokenPurchase = async () => {
    const result = await purchaseTokens(
      auth.userId,
      selectedTokenPackage,
      mpesaNumber,
      showNotification,
    );
    if (result.success) {
      setShowTokenPurchase(false);
      setMpesaNumber("");
    }
  };

  const handleWithdraw = async () => {
    const result = await withdrawEarnings(
      auth.userId,
      withdrawAmount,
      auth.totalEarned,
      showNotification,
    );
    if (result.success) {
      auth.setTotalEarned(auth.totalEarned - result.amount);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchEarningsHistory(auth.userId);
    }
  };

  const handleStartCall = (profile) => {
    if (!auth.isLoggedIn) {
      showNotification("Please login to make a call", "error");
      setShowAuthModal(true);
      return;
    }

    if (!profile.isOnline) {
      showNotification("📵 This model is currently offline", "error");
      return;
    }

    if (auth.userRole !== "client")
      return showNotification("Only clients can initiate calls", "error");
    if (auth.userTokens < 1)
      return showNotification("No tokens! Please purchase more.", "error");

    setPendingProfile(profile);
    setShowSafetyWarning(true);
  };

  const handleViewModelProfile = (profile) => {
    setSelectedModelProfile(profile);
    setShowViewModelProfile(true);
  };

  const confirmCall = async () => {
    setShowSafetyWarning(false);
    declinedRef.current = false;

    try {
      // CLOSE any existing tracks first
      if (localTrack) {
        if (localTrack.videoTrack) {
          localTrack.videoTrack.stop();
          localTrack.videoTrack.close();
        }
        if (localTrack.audioTrack) {
          localTrack.audioTrack.stop();
          localTrack.audioTrack.close();
        }
        setLocalTrack(null);
        console.log("✅ Closed previous tracks");
      }

      // FORCE LEAVE any existing connection
      try {
        await client.leave();
        console.log("✅ Left any previous channel");
      } catch (err) {
        console.log("ℹ️ No previous channel to leave");
      }

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const profile = pendingProfile;
      const receiverUserId =
        typeof profile.userId === "object"
          ? profile.userId._id
          : profile.userId;
      const channelName = `call_${auth.userId}_${receiverUserId}`;

      console.log("📞 Creating call...");
      await callAPI.create({
        callerId: auth.userId,
        receiverId: receiverUserId,
        channelName,
        callerName: auth.userName || auth.userNickname || "Client",
        callerAge: auth.userAge,
        callerLocation: auth.userLocation,
      });

      setActiveCall(profile);
      setCallStatus("ringing");
      const uid = Math.floor(Math.random() * 100000);

      console.log("🔄 Getting token...");
      const tokenData = await getAgoraToken(channelName, uid);
      if (!tokenData) {
        console.error("❌ Failed to get token");
        setActiveCall(null);
        setCallStatus(null);
        showNotification("Failed to get connection token", "error");
        return;
      }

      console.log("🔄 Joining channel...");
      await client.join(tokenData.appId, channelName, tokenData.token, uid);

      console.log("🎥 Creating tracks...");
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalTrack({ videoTrack, audioTrack });

      console.log("📤 Publishing...");
      await client.publish([videoTrack, audioTrack]);

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current, { fit: "contain" });
      }

      console.log("👂 Setting up listeners...");

      client.removeAllListeners("user-published");
      client.removeAllListeners("user-left");

      client.on("user-published", async (user, mediaType) => {
        if (declinedRef.current) return;
        console.log("📥 Model published:", mediaType);
        setCallStatus("connecting");
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current, { fit: "contain" });
          setCallStatus("connected");
          setInCall(true); // START TIMER NOW
          console.log("✅ Call in progress! Timer started.");
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-left", async (user) => {
        console.log("👋 Model left");
        handleEndCall("other");
      });

      console.log("✅ Ringing...");
    } catch (error) {
      console.error("❌ Call failed:", error.message);
      showNotification("Failed to start call: " + error.message, "error");
      setActiveCall(null);
      setCallStatus(null);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("🟢 Model accepting call:", incomingCall.id);

      // REQUEST PERMISSIONS FIRST
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("✅ Camera and mic permissions granted");
      } catch (permErr) {
        console.error("❌ Permission denied:", permErr);
        showNotification("Please allow camera and microphone access", "error");
        setIncomingCall(null);
        return;
      }

      // CLOSE any existing tracks first
      if (localTrack) {
        if (localTrack.videoTrack) {
          localTrack.videoTrack.stop();
          localTrack.videoTrack.close();
        }
        if (localTrack.audioTrack) {
          localTrack.audioTrack.stop();
          localTrack.audioTrack.close();
        }
        setLocalTrack(null);
        console.log("✅ Closed previous tracks");
      }

      // FORCE LEAVE any existing connection
      try {
        await client.leave();
        console.log("✅ Left any previous channel");
      } catch (err) {
        console.log("ℹ️ No previous channel to leave");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mark call as accepted on backend
      await callAPI.accept({ callId: incomingCall.id });

      // Clear incoming call IMMEDIATELY
      setIncomingCall(null);
      setCallStatus("connecting");
      setActiveCall({
        name: incomingCall.callerName || "Client",
        userId: incomingCall.callerId,
      });

      const uid = Math.floor(Math.random() * 100000);

      console.log(
        "🔄 Getting Agora token for channel:",
        incomingCall.channelName,
      );
      const tokenData = await getAgoraToken(incomingCall.channelName, uid);

      if (!tokenData) {
        console.error("❌ Failed to get token");
        showNotification("Failed to get connection token", "error");
        setCallStatus(null);
        setActiveCall(null);
        return;
      }

      console.log("✅ Token received");
      console.log("🔄 Joining Agora channel...");

      await client.join(
        tokenData.appId,
        incomingCall.channelName,
        tokenData.token,
        uid,
      );

      console.log("✅ Joined channel");
      console.log("🎥 Creating NEW camera and mic tracks...");

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      console.log("✅ Tracks created");
      setLocalTrack({ videoTrack, audioTrack });

      console.log("📤 Publishing tracks...");
      await client.publish([videoTrack, audioTrack]);
      console.log("✅ Tracks published");

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current, { fit: "contain" });
        console.log("✅ Local video playing");
      }

      console.log("👂 Setting up event listeners...");

      client.removeAllListeners("user-published");
      client.removeAllListeners("user-left");

      client.on("user-published", async (user, mediaType) => {
        console.log("📥 Remote user published:", mediaType);
        try {
          await client.subscribe(user, mediaType);
          console.log("✅ Subscribed to", mediaType);

          if (mediaType === "video" && remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current, { fit: "contain" });
            setCallStatus("connected");
            setInCall(true); // START TIMER NOW
            console.log("✅ Call in progress! Timer started.");
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        } catch (err) {
          console.error("❌ Subscribe error:", err);
        }
      });

      client.on("user-left", async (user) => {
        console.log("👋 Remote user left");
        handleEndCall("other");
      });

      console.log("✅ Model ready, waiting for client...");
    } catch (error) {
      console.error("❌ Accept call failed:", error.message);
      showNotification("Failed to accept call: " + error.message, "error");
      setCallStatus(null);
      setIncomingCall(null);
      setActiveCall(null);
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      await callAPI.reject({ callId: incomingCall.id });
    } catch (error) {
      console.error("Error rejecting call:", error);
    }

    setIncomingCall(null);
    showNotification("📵 Call declined", "success");
  };

  const handleEndCall = async (endedBy = "self") => {
    try {
      // CALCULATE EVERYTHING BEFORE CLEARING STATE
      const finalDuration = callDuration;

      // Calculate based on actual seconds (1 token = 60 seconds = 23 KSh per minute)
      const tokensUsed = Math.ceil(finalDuration / 60);
      const amount = Math.ceil((finalDuration / 60) * TOKEN_TO_KSH); // KSh per minute

      console.log("📊 Call Summary:", {
        finalDuration,
        tokensUsed,
        amount,
        role: auth.userRole,
      });

      // Save call to database
      if (activeCall && finalDuration > 0) {
        try {
          await fetch(`${API_URL}/calls/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callerId:
                auth.userRole === "client"
                  ? auth.userId
                  : typeof activeCall.userId === "object"
                    ? activeCall.userId._id
                    : activeCall.userId,
              receiverId:
                auth.userRole === "model"
                  ? auth.userId
                  : typeof activeCall.userId === "object"
                    ? activeCall.userId._id
                    : activeCall.userId,
              duration: finalDuration,
              tokensUsed,
              amountKsh: amount,
              status: "completed",
            }),
          });
        } catch (error) {
          console.error("Error saving call:", error);
        }
      }

      // Notify backend that call ended
      if (activeCall) {
        await callAPI.end({
          callerId: auth.userId,
          receiverId:
            typeof activeCall.userId === "object"
              ? activeCall.userId._id
              : activeCall.userId,
        });
      }

      // Close tracks
      if (localTrack) {
        if (localTrack.videoTrack) {
          localTrack.videoTrack.stop();
          localTrack.videoTrack.close();
        }
        if (localTrack.audioTrack) {
          localTrack.audioTrack.stop();
          localTrack.audioTrack.close();
        }
      }

      await client.leave();

      // Update earnings for model
      if (auth.userRole === "model" && amount > 0) {
        const newTotal = auth.totalEarned + amount;
        auth.setTotalEarned(newTotal);

        // Also update in backend
        try {
          await fetch(`${API_URL}/auth/update-earnings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: auth.userId,
              totalEarned: newTotal,
            }),
          });
        } catch (err) {
          console.log("Could not update backend earnings:", err);
        }
      }

      // SET CALL ENDED DATA WITH CALCULATED VALUES
      setCallEndedData({
        duration: finalDuration,
        tokensUsed: tokensUsed,
        amountKsh: amount,
        isModel: auth.userRole === "model",
        totalEarnedToday:
          auth.userRole === "model" ? auth.totalEarned + amount : undefined,
        endedBy,
      });

      // THEN clear all state
      setActiveCall(null);
      setInCall(false);
      setLocalTrack(null);
      setCallDuration(0);
      setIncomingCall(null);
      setCallStatus(null);
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // SHOW MODAL AFTER SETTING DATA
      setShowCallEndedModal(true);

      fetchCallHistory(auth.userId);
      if (auth.userRole === "model") {
        fetchEarningsHistory(auth.userId);
      }
    } catch (error) {
      console.error("Error ending call:", error);
      // Force cleanup
      setActiveCall(null);
      setInCall(false);
      setLocalTrack(null);
      setIncomingCall(null);
      setCallStatus(null);
    }
  };

  const handleGiftTokens = (amount) => {
    if (auth.userTokens < amount)
      return showNotification("Insufficient tokens!", "error");
    showNotification(`💝 Gifted ${amount} tokens!`, "success");
    auth.setUserTokens(auth.userTokens - amount);
    setShowGiftModal(false);
  };

  // Render
  if (inCall || callStatus) {
    return (
      <>
        <CallScreen
          activeCall={activeCall}
          callDuration={callDuration}
          userRole={auth.userRole}
          userTokens={auth.userTokens}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onGiftClick={() => setShowGiftModal(true)}
          onEndCall={handleEndCall}
          callStatus={callStatus}
        />
        <GiftModal
          show={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          recipientName={activeCall?.name}
          onGift={handleGiftTokens}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <Notification notification={notification} />

      <Header
        isLoggedIn={auth.isLoggedIn}
        userRole={auth.userRole}
        userName={auth.userName}
        userNickname={auth.userNickname}
        userTokens={auth.userTokens}
        totalEarned={auth.totalEarned}
        onlineCount={onlineCount}
        onProfileClick={() =>
          auth.userRole === "client"
            ? handleOpenProfileEdit()
            : handleOpenModelProfile()
        }
        onEarningsClick={() => setShowPaymentSetup(true)}
        onCallHistoryClick={() => setShowCallHistory(true)}
        onLogout={() => {
          auth.logout();
          setShowAuthModal(false);
        }}
        onAuthClick={() => {
          setShowAuthModal(true);
          setAuthMode("login");
        }}
      />

      {auth.userRole === "model" ? (
        <ModelDashboard
          totalEarned={auth.totalEarned}
          onlineCount={onlineCount}
        />
      ) : (
        <ProfileGrid
          profiles={profiles}
          loading={loading}
          isLoggedIn={auth.isLoggedIn}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onTokenPurchase={handleTokenPurchase}
          onStartCall={handleStartCall}
          onViewProfile={handleViewModelProfile}
        />
      )}

      {/* All Modals */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        form={form}
        setForm={setForm}
        onSignup={handleSignup}
        onLogin={handleLogin}
        handlePictureUpload={handlePictureUpload}
      />

      <VerificationModal
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={form.email}
        code={verificationCode}
        setCode={setVerificationCode}
        onVerify={handleVerifyEmail}
      />

      <ProfileEditModal
        show={showProfileEdit && auth.userRole === "client"}
        onClose={() => setShowProfileEdit(false)}
        form={form}
        setForm={setForm}
        onSave={handleProfileUpdate}
        handlePictureUpload={handlePictureUpload}
        userName={auth.userName}
        userEmail={auth.userEmail}
      />

      <ModelProfileModal
        show={showModelProfile && auth.userRole === "model"}
        onClose={() => setShowModelProfile(false)}
        userName={auth.userName}
        userNickname={auth.userNickname}
        userEmail={auth.userEmail}
        form={form}
        setForm={setForm}
        handlePictureUpload={handlePictureUpload}
        onSave={handleProfileUpdate}
        callHistory={callHistory}
      />

      <PaymentSetupModal
        show={showPaymentSetup}
        onClose={() => setShowPaymentSetup(false)}
        totalEarned={auth.totalEarned}
        paymentMethod={form.paymentMethod}
        onPaymentMethodChange={handlePaymentMethodChange}
        onWithdrawClick={() => {
          setShowPaymentSetup(false);
          setShowWithdrawModal(true);
        }}
        onEarningsHistoryClick={() => {
          setShowPaymentSetup(false);
          setShowEarningsHistory(true);
        }}
      />

      <TokenPurchaseModal
        show={showTokenPurchase}
        onClose={() => {
          setShowTokenPurchase(false);
          setMpesaNumber("");
        }}
        selectedPackage={selectedTokenPackage}
        mpesaNumber={mpesaNumber}
        setMpesaNumber={setMpesaNumber}
        onConfirm={confirmTokenPurchase}
      />

      <WithdrawModal
        show={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setWithdrawAmount("");
        }}
        totalEarned={auth.totalEarned}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        onConfirm={handleWithdraw}
      />

      <CallHistoryModal
        show={showCallHistory}
        onClose={() => setShowCallHistory(false)}
        callHistory={callHistory}
      />

      <EarningsHistoryModal
        show={showEarningsHistory}
        onClose={() => setShowEarningsHistory(false)}
        earningsHistory={earningsHistory}
      />

      <SafetyWarningModal
        show={showSafetyWarning}
        onClose={() => setShowSafetyWarning(false)}
        onConfirm={confirmCall}
      />

      <IncomingCallModal
        show={!!incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        callerInfo={
          incomingCall
            ? {
                name: incomingCall.callerName,
                age: incomingCall.callerAge,
                location: incomingCall.callerLocation,
              }
            : null
        }
      />

      <CallEndedModal
        show={showCallEndedModal}
        onClose={() => setShowCallEndedModal(false)}
        callData={callEndedData}
      />

      <ViewModelProfileModal
        show={showViewModelProfile}
        onClose={() => setShowViewModelProfile(false)}
        profile={selectedModelProfile}
        onCall={handleStartCall}
      />
    </div>
  );
}
