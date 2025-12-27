import React from 'react';
import { Zap } from 'lucide-react';

export const TokenPurchaseModal = ({ 
  show, 
  onClose, 
  selectedPackage, 
  mpesaNumber, 
  setMpesaNumber, 
  onConfirm 
}) => {
  if (!show || !selectedPackage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <Zap className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Purchase Tokens</h3>
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-xl mb-6 text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">{selectedPackage.tokens} Tokens</div>
          <div className="text-2xl font-bold text-purple-600">KSh {selectedPackage.price.toLocaleString()}</div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Enter M-Pesa Number</label>
          <input 
            type="tel" 
            placeholder="0712345678" 
            value={mpesaNumber} 
            onChange={(e) => setMpesaNumber(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-xs text-gray-500 mt-2">You'll receive an M-Pesa prompt on this number</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};