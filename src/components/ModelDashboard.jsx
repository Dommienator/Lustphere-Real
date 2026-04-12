import React from "react";

export const ModelDashboard = ({ totalEarned, onlineCount }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Model Dashboard
        </h2>
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {totalEarned.toLocaleString()} KSh
        </div>
        <p className="text-gray-600 text-sm mb-4">Total Earned</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xl font-bold text-gray-800">
              {onlineCount.clients}
            </div>
            <div className="text-xs text-gray-600">Clients Online</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xl font-bold text-gray-800">
              {onlineCount.models}
            </div>
            <div className="text-xs text-gray-600">Models Online</div>
          </div>
        </div>
      </div>
    </div>
  );
};
