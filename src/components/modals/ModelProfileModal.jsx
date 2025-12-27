import React from 'react';
import { Upload } from 'lucide-react';

export const ModelProfileModal = ({ 
  show, 
  onClose, 
  userName, 
  userNickname,
  form,
  setForm,
  handlePictureUpload,
  onSave,
  callHistory 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">My Profile</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        
        <div className="mb-6 text-center">
          <div className="text-6xl mb-3">💎</div>
          <h4 className="text-xl font-bold text-gray-800">{userName}</h4>
          <p className="text-purple-600 font-semibold">@{userNickname}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl mb-6">
          <h5 className="font-bold text-gray-800 mb-4">Edit Profile</h5>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nickname" 
              value={form.nickname} 
              onChange={(e) => setForm({ ...form, nickname: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            
            <input 
              type="text" 
              placeholder="Tagline" 
              value={form.tagline} 
              onChange={(e) => setForm({ ...form, tagline: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            
            <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-500 transition">
              <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" id="pic-model-edit" />
              <label htmlFor="pic-model-edit" className="cursor-pointer">
                {form.picturePreview ? (
                  <img src={form.picturePreview} alt="Preview" className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-4 border-pink-300" />
                ) : (
                  <Upload className="w-10 h-10 mx-auto text-pink-400 mb-2" />
                )}
                <p className="text-sm text-gray-600">{form.picturePreview ? 'Change Photo' : 'Upload New Photo'}</p>
              </label>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
          <h5 className="font-bold text-gray-800 mb-4">Recent Calls</h5>
          {callHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No calls yet</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {callHistory.slice(0, 10).map((call, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{call.clientName || 'Client'}</div>
                    <div className="text-xs text-gray-600">{new Date(call.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600 text-sm">{call.duration} min</div>
                    <div className="text-xs text-green-600">+KSh {call.earned}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};