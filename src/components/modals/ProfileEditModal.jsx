import React from "react";
import { X, Upload, Trash2 } from "lucide-react";

export const ProfileEditModal = ({
  show,
  onClose,
  form,
  setForm,
  onSave,
  handlePictureUpload,
  userName,
  userEmail,
}) => {
  if (!show) return null;

  const handleDeletePicture = () => {
    setForm({ ...form, picturePreview: null });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          {/* Non-editable info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
            <div>
              <p className="text-sm text-gray-500">
                Full Name (cannot be changed)
              </p>
              <p className="text-lg font-semibold">{userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email (cannot be changed)</p>
              <p className="text-lg font-semibold">{userEmail}</p>
            </div>
          </div>

          {/* Profile Picture - Optional for clients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture{" "}
              <span className="text-gray-500 text-xs">(Optional)</span>
            </label>

            {form.picturePreview ? (
              <div className="text-center">
                <img
                  src={form.picturePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-3 border-4 border-purple-200"
                />
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  <Trash2 size={16} />
                  Delete Picture
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

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
            {form.location && (
              <p className="text-xs text-gray-500 mt-1">
                Current: {form.location}
              </p>
            )}
          </div>

          {/* Buttons - Sticky at bottom */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
