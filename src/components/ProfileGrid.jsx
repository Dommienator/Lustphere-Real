import React from "react";
import { Phone, MapPin, User } from "lucide-react";
import { PRICING_TIERS, PROFILES_PER_PAGE } from "../utils/constants";

export const ProfileGrid = ({
  profiles,
  loading,
  isLoggedIn,
  currentPage,
  setCurrentPage,
  onTokenPurchase,
  onStartCall,
  onViewProfile,
}) => {
  const totalPages = Math.ceil(profiles.length / PROFILES_PER_PAGE);
  const startIdx = (currentPage - 1) * PROFILES_PER_PAGE;
  const displayedProfiles = profiles.slice(
    startIdx,
    startIdx + PROFILES_PER_PAGE,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Token Packages */}
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          💎 Token Packages - 1 Token = KSh 23
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRICING_TIERS.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => onTokenPurchase(tier)}
              className="bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-xl p-4 md:p-6 text-center hover:scale-105 transition cursor-pointer"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {tier.tokens}
              </div>
              <div className="text-sm mb-2 opacity-90">Tokens</div>
              <div className="text-xl md:text-2xl font-bold mb-2">
                KSh {tier.price.toLocaleString()}
              </div>
              <div className="text-xs opacity-80 mb-2">
                KSh {tier.perToken}/token
              </div>
              {tier.savings > 0 && (
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-bold">
                  Save {tier.savings}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Models List */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isLoggedIn ? "Available Models" : "Meet Our Models"}
      </h2>

      {loading ? (
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p>No models available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {displayedProfiles.map((profile) => (
              <div
                key={profile._id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-pink-300 to-purple-400 p-4 md:p-6 text-center relative">
                  {profile.picture && profile.picture.startsWith("data:") ? (
                    <img
                      src={profile.picture}
                      alt={profile.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="text-5xl md:text-7xl">
                      {profile.picture || "👩"}
                    </div>
                  )}
                  <div
                    className={`absolute top-2 right-2 flex items-center gap-1 ${
                      profile.isOnline ? "bg-pink-500" : "bg-gray-400"
                    } text-white text-xs px-2 py-1 rounded-full`}
                  >
                    <div
                      className={`w-2 h-2 bg-white rounded-full ${
                        profile.isOnline ? "animate-pulse" : ""
                      }`}
                    />
                    {profile.isOnline ? "Online" : "Offline"}
                  </div>
                </div>

                <div className="p-4">
                  {/* Name - Clickable to view profile */}
                  <h3
                    onClick={() => onViewProfile && onViewProfile(profile)}
                    className="text-lg md:text-xl font-bold text-gray-800 mb-2 text-center cursor-pointer hover:text-purple-600 transition"
                  >
                    {profile.nickname || profile.name}
                  </h3>

                  {/* Age - WITH ICON */}
                  {profile.age && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>{profile.age} years old</span>
                    </div>
                  )}

                  {/* Location - WITH ICON */}
                  {profile.location && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {/* Tagline */}
                  {profile.tagline && (
                    <p className="text-xs md:text-sm text-purple-600 italic mb-3 text-center line-clamp-2">
                      "{profile.tagline}"
                    </p>
                  )}

                  {/* Call Button */}
                  <button
                    onClick={() => onStartCall(profile)}
                    disabled={!profile.isOnline && isLoggedIn}
                    className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      !profile.isOnline && isLoggedIn
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white hover:shadow-lg"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    {!isLoggedIn
                      ? "Login to Call"
                      : profile.isOnline
                        ? "Video Call"
                        : "Offline"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      page === currentPage
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
