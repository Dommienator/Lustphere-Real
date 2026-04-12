import React from "react";

export const Header = ({
  isLoggedIn,
  userRole,
  userNickname,
  userName,
  userTokens,
  totalEarned,
  onlineCount,
  onProfileClick,
  onEarningsClick,
  onCallHistoryClick,
  onLogout,
  onAuthClick,
}) => {
  return (
    <div className="bg-gray-900 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
        <h1 className="text-xl font-bold">LustSphere HD</h1>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {userRole === "client" ? (
              <>
                <button
                  onClick={onProfileClick}
                  className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 font-semibold"
                >
                  {userNickname || userName}
                </button>
                <div className="bg-gray-800 px-3 py-1 rounded font-bold">
                  {userTokens} Tokens
                </div>
                <button
                  onClick={onCallHistoryClick}
                  className="hover:underline"
                >
                  History
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onProfileClick}
                  className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 font-semibold"
                >
                  {userNickname || userName}
                </button>
                <button
                  onClick={onEarningsClick}
                  className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 font-bold"
                >
                  {totalEarned.toLocaleString()} KSh
                </button>
                <div className="text-xs text-gray-400">
                  {onlineCount.clients} clients • {onlineCount.models} models
                </div>
              </>
            )}
            <button
              onClick={onLogout}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded font-bold"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </div>
  );
};
