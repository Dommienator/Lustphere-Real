import React from 'react';
import { User, Zap, LogOut } from 'lucide-react';

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
  onAuthClick
}) => {
  return (
    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="text-4xl">💜</div>
          <h1 className="text-3xl font-bold">LustSphere HD</h1>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4 flex-wrap text-sm">
            {userRole === 'client' ? (
              <>
                <button onClick={onProfileClick} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{userNickname || userName}</span>
                </button>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">{userTokens} Tokens</span>
                </div>
                <button onClick={onCallHistoryClick} className="hover:underline">Call History</button>
              </>
            ) : (
              <>
                <button onClick={onProfileClick} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{userNickname || userName}</span>
                </button>
                <button onClick={onEarningsClick} className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-opacity-30">
                  <span className="font-semibold">💰 KSh {totalEarned.toLocaleString()}</span>
                </button>
                <div className="bg-white bg-opacity-20 px-3 py-2 rounded-full text-xs">
                  <span>👥 {onlineCount.clients} clients • 💎 {onlineCount.models} models online</span>
                </div>
              </>
            )}
            <button onClick={onLogout} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        ) : (
          <button onClick={onAuthClick} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-semibold">
            Login / Sign Up
          </button>
        )}
      </div>
    </div>
  );
};