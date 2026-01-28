import { useState } from "react";
import { API_URL } from "../utils/constants";

export const useProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profiles`);
      const data = await response.json();
      setProfiles(data.profiles || []);
      setOnlineCount(data.onlineCount || 0);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId, profileData, showNotification) => {
    try {
      const response = await fetch(`${API_URL}/profiles/update`, {
        // FIXED: Added 's'
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...profileData }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Profile updated successfully!", "success");
        return { success: true, data };
      } else {
        showNotification(data.message || "Failed to update profile", "error");
        return { success: false };
      }
    } catch (error) {
      showNotification("Network error while updating profile", "error");
      console.error("Update profile error:", error);
      return { success: false };
    }
  };

  const updatePaymentMethod = async (
    userId,
    paymentMethod,
    showNotification,
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/payment-method`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, paymentMethod }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Payment method updated!", "success");
        return { success: true, data };
      } else {
        showNotification(
          data.message || "Failed to update payment method",
          "error",
        );
        return { success: false };
      }
    } catch (error) {
      showNotification("Network error", "error");
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
