import React from 'react';
import { Zap, Gift, PhoneOff } from 'lucide-react';
import { TOKEN_TO_KSH } from '../utils/constants';
import { formatTime } from '../utils/validation';

export const CallScreen = ({ 
  activeCall,
  callDuration,
  userRole,
  userTokens,
  localVideoRef,
  remoteVideoRef,
  onGiftClick,
  onEndCall
}) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 p-4 flex justify-between items-center">
        <div className="text-white">
          <div className="text-xl font-bold">{activeCall?.name || 'Call'}</div>
          <div className="text-sm opacity-90">Duration: {formatTime(callDuration)}</div>
        </div>
        <div className="flex items-center gap-4">
          {userRole === 'client' && (
            <>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold">
                <Zap className="w-4 h-4 inline mr-1" /> {userTokens}
              </div>
              <button onClick={onGiftClick} className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4" /> Gift
              </button>
            </>
          )}
          {userRole === 'model' && (
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold">
              💰 Earning: KSh {Math.ceil(callDuration / 30) * TOKEN_TO_KSH}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4 p-4">
        <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-pink-400">
          <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800" />
        </div>
        <div className="w-96 h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-400">
          <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} className="bg-gray-800" />
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <button onClick={onEndCall} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-semibold flex items-center gap-2">
          <PhoneOff className="w-6 h-6" /> End Call
        </button>
      </div>
    </div>
  );
};