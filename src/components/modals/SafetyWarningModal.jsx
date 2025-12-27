import React from 'react';
import { AlertCircle } from 'lucide-react';

export const SafetyWarningModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-pink-500" />
        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">Safety First</h3>
        <div className="text-gray-700 space-y-3 mb-6">
          <p className="font-semibold">⚠️ Important Safety Guidelines:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Never agree to meet strangers in person</li>
            <li>Keep all interactions within the platform</li>
            <li>Do not share personal information</li>
            <li>Report any inappropriate behavior</li>
            <li>Stay safe and respectful</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};