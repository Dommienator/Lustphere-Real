import React from 'react';

export const IncomingCallModal = ({ show, onAccept, onReject }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">📞</div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Incoming Call</h3>
        <p className="text-gray-600 mb-8">A client is calling you!</p>
        <div className="flex gap-4">
          <button onClick={onAccept} className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-semibold">
            Accept
          </button>
          <button onClick={onReject} className="flex-1 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-semibold">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};