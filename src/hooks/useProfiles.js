import { useState } from "react";
import { profileAPI } from "../services/api";

export const useProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [onlineCount, setOnlineCount] = useState({ clients: 0, models: 0 });
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.getAll();
      const data = await response.json();

      // Backend now returns { profiles: [...], onlineCount: 5 }
      if (data.profiles && Array.isArray(data.profiles)) {
        const online = data.profiles.filter((p) => p.isOnline);
        const offline = data.profiles.filter((p) => !p.isOnline);

        // Online first, then offline
        setProfiles([...online, ...offline]);

        setOnlineCount({
          models: data.onlineCount, // Real count from backend
          clients: online.length * 2, // Estimate: assume 2 clients per online model
        });
      } else if (Array.isArray(data)) {
        // Fallback for old format
        setProfiles(data);
        const onlineModels = data.filter(
          (p) => p.isOnline || p.userId?.isOnline
        ).length;
        setOnlineCount({
          models: onlineModels,
          clients: onlineModels * 2,
        });
      } else {
        setProfiles([]);
        setOnlineCount({ models: 0, clients: 0 });
      }
    } catch (error) {
      console.error("Fetch profiles error:", error);
      setProfiles([]);
      setOnlineCount({ models: 0, clients: 0 });
    }
    setLoading(false);
  };

  const updateProfile = async (userId, data, showNotification) => {
    try {
      const response = await profileAPI.update({
        userId,
        nickname: data.nickname,
        tagline: data.tagline,
        picture: data.picture,
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("✅ Profile updated!", "success");
        fetchProfiles();
        return { success: true };
      } else {
        showNotification(result.message || "Update failed", "error");
        return { success: false };
      }
    } catch (error) {
      showNotification("Update failed", "error");
      return { success: false };
    }
  };

  const updatePaymentMethod = async (userId, method, showNotification) => {
    try {
      const response = await profileAPI.updatePaymentMethod({
        userId,
        paymentMethod: method,
      });
      const data = await response.json();

      if (response.ok) {
        showNotification("✅ Payment method updated!", "success");
        return { success: true };
      } else {
        showNotification(data.message || "Update failed", "error");
        return { success: false };
      }
    } catch (error) {
      showNotification("Update failed", "error");
      return { success: false };
    }
  };

  return {
    profiles,
    onlineCount,
    loading,
    fetchProfiles,
    updateProfile,
    updatePaymentMethod,
  };
};
