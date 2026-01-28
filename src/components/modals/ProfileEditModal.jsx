import React from "react";
import { X } from "lucide-react";

export const ProfileEditModal = ({ show, onClose, form, setForm, onSave }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          {/* Nickname - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nickname
            </label>
            <input
              type="text"
              value={form.nickname || ""}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="Your nickname"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Location - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Nairobi, Kenya"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
