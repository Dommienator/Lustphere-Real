import React from 'react';

export const ModelDashboard = ({ totalEarned, onlineCount }) => {
  return (
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
  );
};