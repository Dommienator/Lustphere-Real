import React from "react";
import { Phone, Gift } from "lucide-react";

export const CallScreen = ({
  activeCall,
  callDuration,
  userRole,
  userTokens,
  localVideoRef,
  remoteVideoRef,
  onGiftClick,
  onEndCall,
  callStatus,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (callStatus === "ringing") return "📞 Ringing...";
    if (callStatus === "connecting") return "🔄 Connecting...";
    if (callStatus === "connected") return "✅ Call in Progress";
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {activeCall?.name || activeCall?.nickname || "In Call"}
          </h2>
          <p className="text-sm opacity-90">{getStatusText()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatTime(callDuration)}</p>
          {userRole === "client" && (
            <p className="text-sm opacity-90">Tokens: {userTokens}</p>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video (Other Person) - LARGER */}
        <div className="absolute inset-0">
          <div ref={remoteVideoRef} className="w-full h-full bg-gray-800" />
        </div>

        {/* Local Video (You) - SMALLER, Picture-in-Picture */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg z-10">
          <div ref={localVideoRef} className="w-full h-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 flex justify-center gap-4">
        {userRole === "client" && (
          <button
            onClick={onGiftClick}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition"
          >
            <Gift size={20} />
            Send Gift
          </button>
        )}
        <button
          onClick={() => onEndCall("self")}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition"
        >
          <Phone size={20} />
          End Call
        </button>
      </div>
    </div>
  );
};
