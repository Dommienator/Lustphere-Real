import React from "react";

export const IncomingCallModal = ({ show, onAccept, onReject, callerInfo }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4 animate-bounce">
            <span className="text-6xl">📞</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Incoming Call
          </h2>

          {/* Caller Details */}
          {callerInfo && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                From: {callerInfo.name || "Client"}
              </p>
              {callerInfo.age && (
                <p className="text-sm text-gray-600">Age: {callerInfo.age}</p>
              )}
              {callerInfo.location && (
                <p className="text-sm text-gray-600">
                  Location: {callerInfo.location}
                </p>
              )}
            </div>
          )}

          {!callerInfo && (
            <p className="text-gray-600 mb-6">Someone is calling you...</p>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onReject}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
