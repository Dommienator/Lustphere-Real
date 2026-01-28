import React from "react";
import { X, Phone, Home } from "lucide-react";

export const CallEndedModal = ({ show, onClose, callData }) => {
  if (!show || !callData) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isDeclined = callData.status === "declined";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isDeclined ? "📵 Call Declined" : "📞 Call Ended"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isDeclined ? (
            <>
              <p className="text-center text-gray-600 mb-4">
                The model declined your call. Please try again later or call
                another model.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  Try Again Later
                </button>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = "/";
                  }}
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Home size={20} />
                  Call Another Model
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-lg text-center">
                <div className="text-5xl mb-3">⏱️</div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-3xl font-bold text-gray-800 mb-4">
                  {formatDuration(callData.duration)}
                </p>

                {callData.isModel ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">You Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      KSh {callData.amountKsh}
                    </p>
                    {callData.totalEarnedToday !== undefined && (
                      <p className="text-sm text-gray-500 mt-2">
                        Total Earned: KSh {callData.totalEarnedToday.toFixed(2)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Tokens Used</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {callData.tokensUsed} tokens
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Cost: KSh {callData.amountKsh}
                    </p>
                  </>
                )}
              </div>

              {callData.endedBy === "other" && (
                <p className="text-center text-sm text-gray-500 italic">
                  {callData.isModel
                    ? "Client ended the call"
                    : "Model ended the call"}
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
