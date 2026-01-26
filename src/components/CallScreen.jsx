import React from "react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-purple-900 relative">
      {/* Remote Video - Full Screen */}
      <div className="w-full h-screen bg-black">
        <div ref={remoteVideoRef} className="w-full h-full"></div>
      </div>

      {/* Local Video - Picture in Picture */}
      <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-black rounded-lg overflow-hidden shadow-2xl z-10 border-2 border-white">
        <div ref={localVideoRef} className="w-full h-full"></div>
        <div className="absolute bottom-2 left-2 text-white text-xs md:text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          You
        </div>
      </div>

      {/* Call Status - Shows when ringing or connecting */}
      {callStatus && callStatus !== "connected" && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full z-20 text-lg font-semibold shadow-lg">
          {callStatus === "ringing" && "📞 Ringing..."}
          {callStatus === "connecting" && "🔄 Connecting..."}
        </div>
      )}

      {/* Call Info - Top Left */}
      <div className="absolute top-4 left-4 text-white z-10 bg-black bg-opacity-50 px-4 py-3 rounded-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          {activeCall?.nickname || activeCall?.name || "Unknown"}
        </h2>
        <div className="text-lg md:text-xl font-mono">
          {formatTime(callDuration)}
        </div>
        {userRole === "client" && (
          <div className="mt-2 text-sm md:text-base">
            💎 Tokens: {userTokens}
          </div>
        )}
        {userRole === "model" && (
          <div className="mt-2 text-sm md:text-base text-green-300">
            💰 Earning...
          </div>
        )}
      </div>

      {/* Controls - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Gift button (clients only) */}
        {userRole === "client" && (
          <button
            onClick={onGiftClick}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110"
            title="Send Gift"
          >
            <span className="text-2xl">🎁</span>
          </button>
        )}

        {/* End Call button */}
        <button
          onClick={onEndCall}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full shadow-lg font-semibold text-lg transition transform hover:scale-105"
        >
          📞 End Call
        </button>
      </div>
    </div>
  );
};
