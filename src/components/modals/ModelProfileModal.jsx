import React, { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { ViewModelProfileModal } from "./ViewModelProfileModal";

export const ModelProfileModal = ({
  show,
  onClose,
  userName,
  userNickname,
  userEmail,
  form,
  setForm,
  handlePictureUpload,
  onSave,
  callHistory,
}) => {
  const [extraPictures, setExtraPictures] = useState(form.extraPictures || []);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (form.extraPictures) {
      setExtraPictures(form.extraPictures);
    }
  }, [form.extraPictures]);

  if (!show) return null;

  const handleDeleteMainPicture = () => {
    setForm({ ...form, picturePreview: null });
  };

  const handleExtraPictureUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPictures = [...extraPictures];
        newPictures[index] = reader.result;
        setExtraPictures(newPictures);
        setForm({ ...form, extraPictures: newPictures });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeExtraPicture = (index) => {
    const newPictures = extraPictures.filter((_, i) => i !== index);
    setExtraPictures(newPictures);
    setForm({ ...form, extraPictures: newPictures });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {/* Non-editable info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm text-gray-500">
                Full Name (cannot be changed)
              </p>
              <p className="text-lg font-semibold">{userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Nickname (cannot be changed)
              </p>
              <p className="text-lg font-semibold">{userNickname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email (cannot be changed)</p>
              <p className="text-lg font-semibold">{userEmail}</p>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture <span className="text-red-500">*</span>
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
                  onClick={handleDeleteMainPicture}
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
                  required
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Extra Pictures (Max 3) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Pictures (Max 3) - Shown to clients
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  {extraPictures[index] ? (
                    <div className="relative group">
                      <img
                        src={extraPictures[index]}
                        alt={`Extra ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraPicture(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleExtraPictureUpload(e, index)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Editable Fields */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <textarea
              value={form.tagline || ""}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Tell clients about yourself..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
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
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 rounded-lg font-semibold transition"
            >
              View My Profile
            </button>
          </div>

          {/* Call History */}
          {callHistory && callHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Calls</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {callHistory.slice(0, 5).map((call, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Duration: {Math.floor(call.duration / 60)}:
                      {(call.duration % 60).toString().padStart(2, "0")}
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      Earned: KSh {call.amountKsh}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <ViewModelProfileModal
            show={showPreview}
            onClose={() => setShowPreview(false)}
            profile={{
              name: userName,
              nickname: userNickname,
              picture: form.picturePreview,
              extraPictures: extraPictures,
              location: form.location,
              tagline: form.tagline,
              age: form.age,
            }}
            onCall={() => {}}
          />
        )}
      </div>
    </div>
  );
};
