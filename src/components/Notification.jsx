import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-pink-600 to-purple-700'} text-white`}>
      {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-semibold">{notification.message}</span>
    </div>
  );
};
