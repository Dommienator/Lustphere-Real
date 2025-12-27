import React from 'react';

export const WithdrawModal = ({ 
  show, 
  onClose, 
  totalEarned, 
  withdrawAmount, 
  setWithdrawAmount, 
  onConfirm 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-6xl text-center mb-4">💰</div>
        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Withdraw Earnings</h3>
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-xl mb-6 text-center">
          <div className="text-sm text-gray-600 mb-1">Available Balance</div>
          <div className="text-3xl font-bold text-purple-600">KSh {totalEarned.toLocaleString()}</div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Withdraw (KSh)</label>
          <input 
            type="number" 
            placeholder="Enter amount" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
            max={totalEarned}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-xs text-gray-500 mt-2">Funds will be sent to your registered payment method</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};