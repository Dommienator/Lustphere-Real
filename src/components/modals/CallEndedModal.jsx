import React from "react";

export const CallEndedModal = ({ show, onClose, callData }) => {
  if (!show) return null;

  const {
    duration,
    tokensUsed,
    amountKsh,
    isModel,
    totalEarnedToday,
    endedBy,
  } = callData;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            <span className="text-6xl">{isModel ? "💰" : "📞"}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {endedBy === "other" ? "Call Ended by Other Party" : "Call Ended"}
          </h2>

          {/* Details */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Duration:</span>
              <span className="font-semibold">{formatTime(duration)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Tokens:</span>
              <span className="font-semibold">{tokensUsed}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-purple-600">
              <span>{isModel ? "Earned:" : "Spent:"}</span>
              <span>KSh {amountKsh}</span>
            </div>

            {isModel && totalEarnedToday !== undefined && (
              <div className="flex justify-between text-gray-600 pt-2 border-t border-purple-200">
                <span>Total Today:</span>
                <span className="font-semibold">KSh {totalEarnedToday}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
