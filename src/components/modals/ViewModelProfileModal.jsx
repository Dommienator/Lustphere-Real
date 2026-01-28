import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

export const ViewModelProfileModal = ({ show, onClose, profile, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!show || !profile) return null;

  // Only extra pictures in slideshow (not profile picture)
  const extraPictures = (profile.extraPictures || []).filter(
    (pic) => pic && pic.startsWith("data:"),
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % extraPictures.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + extraPictures.length) % extraPictures.length,
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {profile.nickname || profile.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Picture - Separate from slideshow */}
        <div className="bg-gradient-to-br from-pink-300 to-purple-400 p-8">
          {profile.picture && profile.picture.startsWith("data:") ? (
            <img
              src={profile.picture}
              alt={profile.name}
              className="w-64 h-64 mx-auto rounded-lg object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="text-7xl text-center">
              {profile.picture || "👩"}
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {profile.age && (
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="text-lg font-semibold">{profile.age} years old</p>
              </div>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-lg font-semibold">{profile.location}</p>
              </div>
            </div>
          )}

          {profile.tagline && (
            <div>
              <p className="text-sm text-gray-500 mb-1">About Me</p>
              <p className="text-lg italic text-purple-600">
                "{profile.tagline}"
              </p>
            </div>
          )}

          {/* Extra Pictures Slideshow */}
          {extraPictures.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">More Photos</p>
              <div className="relative bg-gray-100 rounded-lg p-4">
                <img
                  src={extraPictures[currentImageIndex]}
                  alt={`${currentImageIndex + 1} of ${extraPictures.length}`}
                  className="w-full h-64 object-cover rounded-lg"
                />

                {extraPictures.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Image indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                      {extraPictures.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx === currentImageIndex
                              ? "bg-purple-600"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Call Button */}
          {profile.isOnline && onCall && (
            <button
              onClick={() => {
                onClose();
                onCall(profile);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition mt-6"
            >
              📞 Video Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
