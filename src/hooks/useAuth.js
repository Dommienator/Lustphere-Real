import { useState } from 'react';
import { authAPI } from '../services/api';
import { validatePassword } from '../utils/validation';

export const useAuth = (showNotification, fetchProfiles, fetchCallHistory, fetchEarningsHistory) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [userTokens, setUserTokens] = useState(100);
  const [totalEarned, setTotalEarned] = useState(0);

  const signup = async (formData) => {
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      showNotification(passwordError, 'error');
      return { success: false };
    }
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return { success: false };
    }

    if (formData.role === 'client' && (!formData.email || !formData.nickname)) {
      showNotification('Please enter your email and nickname', 'error');
      return { success: false };
    }

    if (formData.role === 'model' && (!formData.name || !formData.nickname || !formData.email || !formData.password || !formData.age || !formData.location || !formData.picturePreview)) {
      showNotification('Please fill all required fields', 'error');
      return { success: false };
    }

    try {
      const response = await authAPI.signup({
        name: formData.name || 'Client',
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        age: formData.age || null,
        tagline: formData.tagline || '',
        location: formData.location || '',
        picture: formData.picturePreview || '👤',
        paymentMethod: 'mpesa',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('✨ Signup successful! Check your email to verify.', 'success');
        return { success: true, data };
      } else {
        showNotification(data.message || 'Signup failed. Please try again.', 'error');
        console.error('Signup error response:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      showNotification('Network error. Please check connection.', 'error');
      console.error('Signup network error:', error);
      return { success: false, error };
    }
  };

  const login = async (formData) => {
    if (!formData.email || !formData.role || !formData.password) {
      showNotification('Please fill all fields', 'error');
      return { success: false };
    }

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      const data = await response.json();
      
      if (response.ok) {        
        setUserId(data.user._id);
        setUserRole(data.user.role);
        setUserName(data.user.name);
        setUserNickname(data.user.nickname);
        setUserTokens(data.user.tokens || 100);
        setTotalEarned(data.user.totalEarned || 0);
        setIsLoggedIn(true);
        setIsLoggedIn(true);

// Save to localStorage
localStorage.setItem('user', JSON.stringify({
  userId: data.user._id,
  role: data.user.role,
  name: data.user.name,
  nickname: data.user.nickname,
  tokens: data.user.tokens || 100,
  totalEarned: data.user.totalEarned || 0,
}));
        
        showNotification(`💜 Welcome back, ${data.user.nickname || data.user.name}!`, 'success');
        fetchProfiles();
        fetchCallHistory();
        if (data.user.role === 'model') fetchEarningsHistory();
        
        return { success: true, data };
      } else {
        showNotification(data.message || 'Login failed.', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Login failed. Check connection.', 'error');
      return { success: false };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole(null);
    setUserName('');
    setUserNickname('');
    localStorage.removeItem('user');
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await authAPI.verifyEmail({ email, code });
      const data = await response.json();
      
      if (response.ok) {
        showNotification('✅ Email verified! You can now login.', 'success');
        return { success: true };
      } else {
        showNotification(data.message || 'Verification failed', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Verification failed', 'error');
      return { success: false };
    }
  };

  return {
    isLoggedIn, userId, userRole, userName, userNickname, userTokens, totalEarned,
    setUserTokens, setTotalEarned, setUserNickname,
    signup, login, logout, verifyEmail
  };
};