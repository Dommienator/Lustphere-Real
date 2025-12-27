import React from 'react';
import { Phone } from 'lucide-react';

export const CallHistoryModal = ({ show, onClose, callHistory }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Call History</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        
        {callHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Phone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No call history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callHistory.map((call, idx) => (
              <div key={idx} className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{call.modelName || 'Model'}</div>
                  <div className="text-sm text-gray-600">{new Date(call.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{call.duration} min</div>
                  <div className="text-sm text-gray-600">{call.tokens} tokens</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};