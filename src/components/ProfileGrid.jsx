import React, { useState, useMemo } from "react";
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
  const [sortBy, setSortBy] = useState("online"); // online, age, location, random
  const [filterLocation, setFilterLocation] = useState("all");

  // Get unique locations
  const locations = useMemo(() => {
    const locs = [...new Set(profiles.map((p) => p.location).filter(Boolean))];
    return ["all", ...locs.sort()];
  }, [profiles]);

  // Sort and filter profiles
  const sortedProfiles = useMemo(() => {
    let filtered = [...profiles];

    // Filter by location
    if (filterLocation !== "all") {
      filtered = filtered.filter((p) => p.location === filterLocation);
    }

    // Sort
    switch (sortBy) {
      case "online":
        filtered.sort((a, b) => {
          if (a.isOnline === b.isOnline) return 0;
          return a.isOnline ? -1 : 1;
        });
        break;
      case "age":
        filtered.sort((a, b) => {
          const ageA = a.age || 999;
          const ageB = b.age || 999;
          return ageA - ageB;
        });
        break;
      case "location":
        filtered.sort((a, b) => {
          const locA = a.location || "";
          const locB = b.location || "";
          return locA.localeCompare(locB);
        });
        break;
      case "random":
        filtered.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }

    return filtered;
  }, [profiles, sortBy, filterLocation]);

  const totalPages = Math.ceil(sortedProfiles.length / PROFILES_PER_PAGE);
  const startIdx = (currentPage - 1) * PROFILES_PER_PAGE;
  const displayedProfiles = sortedProfiles.slice(
    startIdx,
    startIdx + PROFILES_PER_PAGE,
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterLocation, setCurrentPage]);

  return (
    <div className="max-w-7xl mx-auto px-2 py-4">
      {/* Token Packages - Compact */}
      <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
        <h2 className="text-lg font-bold text-center mb-3 text-gray-800">
          Token Packages • 1 Token = 23 KSh
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {PRICING_TIERS.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => onTokenPurchase(tier)}
              className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg p-3 text-center hover:from-gray-700 hover:to-gray-800 transition"
            >
              <div className="text-2xl font-bold">{tier.tokens}</div>
              <div className="text-xs opacity-75 mb-1">tokens</div>
              <div className="text-sm font-bold">
                {tier.price.toLocaleString()}
              </div>
              {tier.savings > 0 && (
                <div className="bg-white bg-opacity-20 rounded px-2 py-0.5 text-xs font-bold mt-1">
                  -{tier.savings}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white rounded-lg p-3 shadow-sm mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-gray-700">Sort by:</span>
          <button
            onClick={() => setSortBy("online")}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              sortBy === "online"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Online First
          </button>
          <button
            onClick={() => setSortBy("age")}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              sortBy === "age"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Age
          </button>
          <button
            onClick={() => setSortBy("location")}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              sortBy === "location"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Location
          </button>
          <button
            onClick={() => setSortBy("random")}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              sortBy === "random"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Random
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Location:</span>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 text-sm font-semibold bg-white text-gray-700 hover:border-gray-400 cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "all" ? "All Locations" : loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Grid - No Gaps, Large Pictures */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading models...</p>
        </div>
      ) : sortedProfiles.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p>No models match your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-0 border border-gray-200">
            {displayedProfiles.map((profile) => (
              <div
                key={profile._id}
                className="relative bg-white border-r border-b border-gray-200 hover:z-10 hover:shadow-2xl transition group"
              >
                {/* Large Profile Picture */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  {profile.picture && profile.picture.startsWith("data:") ? (
                    <img
                      src={profile.picture}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-gray-100 to-gray-200">
                      👩
                    </div>
                  )}

                  {/* Online Badge - Top Right */}
                  <div
                    className={`absolute top-2 right-2 ${
                      profile.isOnline ? "bg-green-500" : "bg-gray-500"
                    } text-white text-xs font-bold px-2 py-1 rounded`}
                  >
                    {profile.isOnline ? "ONLINE" : "OFFLINE"}
                  </div>

                  {/* Info Overlay - Shows on Hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                    <h3 className="text-white text-xl font-bold mb-1">
                      {profile.nickname || profile.name}
                    </h3>
                    {profile.age && (
                      <p className="text-white text-sm opacity-90">
                        {profile.age} years old
                      </p>
                    )}
                    {profile.location && (
                      <p className="text-white text-sm opacity-90 mb-2">
                        {profile.location}
                      </p>
                    )}
                    {profile.tagline && (
                      <p className="text-white text-xs italic opacity-80 mb-3 line-clamp-2">
                        "{profile.tagline}"
                      </p>
                    )}

                    {/* Call Button */}
                    <button
                      onClick={() => onStartCall(profile)}
                      disabled={!profile.isOnline && isLoggedIn}
                      className={`w-full py-2 rounded font-bold transition ${
                        !profile.isOnline && isLoggedIn
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-white text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {!isLoggedIn
                        ? "LOGIN TO CALL"
                        : profile.isOnline
                          ? "VIDEO CALL"
                          : "OFFLINE"}
                    </button>
                  </div>
                </div>

                {/* Compact Info Below Picture */}
                <div className="p-2 bg-white">
                  <h3
                    onClick={() => onViewProfile && onViewProfile(profile)}
                    className="text-sm font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition truncate"
                  >
                    {profile.nickname || profile.name}
                  </h3>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {profile.age && <span>{profile.age} yrs</span>}
                    {profile.location && (
                      <span className="truncate ml-2">{profile.location}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Minimal */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm font-bold ${
                      page === currentPage
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
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
