import React from 'react';
import { CheckCircle } from 'lucide-react';

export const VerificationModal = ({ show, onClose, email, code, setCode, onVerify }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
          <p className="text-gray-600">We've sent a verification code to {email}</p>
        </div>
        <input 
          type="text" 
          placeholder="Enter 6-digit code" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-2xl tracking-widest mb-4"
          maxLength={6}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
            Cancel
          </button>
          <button onClick={onVerify} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};