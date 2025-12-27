import React from 'react';
import { Gift } from 'lucide-react';
import { TOKEN_TO_KSH } from '../../utils/constants';

export const GiftModal = ({ show, onClose, recipientName, onGift }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
        <Gift className="w-16 h-16 mx-auto mb-4 text-pink-500" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Send a Gift</h2>
        <p className="text-gray-600 mb-6">To {recipientName}</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[5, 10, 20].map(amount => (
            <button 
              key={amount} 
              onClick={() => onGift(amount)} 
              className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-4 rounded-lg font-bold hover:scale-105 transition"
            >
              {amount} Tokens<br />
              <span className="text-sm opacity-90">KSh {amount * TOKEN_TO_KSH}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Cancel</button>
      </div>
    </div>
  );
};