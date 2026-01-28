import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

export const ViewModelProfileModal = ({ show, onClose, profile, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!show || !profile) return null;

  // Combine profile picture with extra pictures
  const allPictures = [
    profile.picture,
    ...(profile.extraPictures || []),
  ].filter((pic) => pic && pic !== "👩" && pic.startsWith("data:"));

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allPictures.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allPictures.length) % allPictures.length,
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

        {/* Image Slideshow */}
        <div className="relative bg-gradient-to-br from-pink-300 to-purple-400 p-8">
          {allPictures.length > 0 ? (
            <>
              <img
                src={allPictures[currentImageIndex]}
                alt={profile.name}
                className="w-64 h-64 mx-auto rounded-lg object-cover border-4 border-white shadow-lg"
              />

              {allPictures.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {allPictures.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx === currentImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-7xl text-center">
              {profile.picture || "👩"}
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {profile.age && (
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg font-semibold">{profile.age}</p>
            </div>
          )}

          {profile.location && (
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <MapPin size={18} /> {profile.location}
              </p>
            </div>
          )}

          {profile.tagline && (
            <div>
              <p className="text-sm text-gray-500">About</p>
              <p className="text-lg italic text-purple-600">
                "{profile.tagline}"
              </p>
            </div>
          )}

          {/* Call Button */}
          {profile.isOnline && (
            <button
              onClick={() => {
                onClose();
                onCall(profile);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
            >
              📞 Video Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
