import React from 'react';

export const PaymentSetupModal = ({ 
  show, 
  onClose, 
  totalEarned, 
  paymentMethod,
  onPaymentMethodChange,
  onWithdrawClick,
  onEarningsHistoryClick 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">Earnings & Payments</h3>
        
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-xl mb-6 text-center">
          <div className="text-sm text-gray-600 mb-1">Total Earned</div>
          <div className="text-4xl font-bold text-purple-600 mb-4">KSh {totalEarned.toLocaleString()}</div>
          <button onClick={onWithdrawClick} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold">
            Withdraw Earnings
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-3">Payment Method</h4>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => onPaymentMethodChange('mpesa')} 
              className={`py-3 rounded-lg font-semibold ${paymentMethod === 'mpesa' ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white' : 'bg-gray-200'}`}
            >
              M-Pesa
            </button>
            <button 
              onClick={() => onPaymentMethodChange('paypal')} 
              className={`py-3 rounded-lg font-semibold ${paymentMethod === 'paypal' ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white' : 'bg-gray-200'}`}
            >
              PayPal
            </button>
            <button 
              onClick={() => onPaymentMethodChange('card')} 
              className={`py-3 rounded-lg font-semibold ${paymentMethod === 'card' ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white' : 'bg-gray-200'}`}
            >
              Card
            </button>
          </div>
        </div>

        <button onClick={onEarningsHistoryClick} className="w-full text-purple-600 font-semibold hover:underline mb-4">
          View Earnings History
        </button>

        <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
          Close
        </button>
      </div>
    </div>
  );
};