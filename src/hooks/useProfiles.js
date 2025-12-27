import { useState } from 'react';
import { profileAPI } from '../services/api';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [onlineCount, setOnlineCount] = useState({ clients: 0, models: 0 });
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.getAll();
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const online = data.filter(p => p.isOnline).sort(() => Math.random() - 0.5);
        const offline = data.filter(p => !p.isOnline).sort(() => Math.random() - 0.5);
        setProfiles([...online, ...offline]);
        setOnlineCount({
          models: online.length,
          clients: Math.floor(Math.random() * 50) + 20
        });
      } else {
        setProfiles([]);
      }
    } catch (error) {
      setProfiles([]);
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
        showNotification('✅ Profile updated!', 'success');
        fetchProfiles();
        return { success: true };
      } else {
        showNotification(result.message || 'Update failed', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Update failed', 'error');
      return { success: false };
    }
  };

  const updatePaymentMethod = async (userId, method, showNotification) => {
    try {
      const response = await profileAPI.updatePaymentMethod({ userId, paymentMethod: method });
      const data = await response.json();
      
      if (response.ok) {
        showNotification('✅ Payment method updated!', 'success');
        return { success: true };
      } else {
        showNotification(data.message || 'Update failed', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Update failed', 'error');
      return { success: false };
    }
  };

  return {
    profiles,
    onlineCount,
    loading,
    fetchProfiles,
    updateProfile,
    updatePaymentMethod
  };
};