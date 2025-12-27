import { useState } from 'react';
import { callAPI, tokenAPI, earningsAPI } from '../services/api';

export const useCallManagement = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);

  const fetchCallHistory = async (userId) => {
    if (!userId) return;
    try {
      const response = await callAPI.getHistory(userId);
      const data = await response.json();
      if (response.ok) {
        setCallHistory(data.calls || []);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  const fetchEarningsHistory = async (userId) => {
    if (!userId) return;
    try {
      const response = await earningsAPI.getHistory(userId);
      const data = await response.json();
      if (response.ok) {
        setEarningsHistory(data.earnings || []);
      }
    } catch (error) {
      console.error('Error fetching earnings history:', error);
    }
  };

  const purchaseTokens = async (userId, packageData, mpesaNumber, showNotification) => {
    if (!mpesaNumber || mpesaNumber.length < 10) {
      showNotification('Enter valid M-Pesa number', 'error');
      return { success: false };
    }
    
    try {
      const response = await tokenAPI.purchase({
        userId,
        tokens: packageData.tokens,
        amount: packageData.price,
        mpesaNumber,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification(`✅ Purchase initiated! Check ${mpesaNumber}`, 'success');
        return { success: true };
      } else {
        showNotification(data.message || 'Purchase failed', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Purchase failed', 'error');
      return { success: false };
    }
  };

  const withdrawEarnings = async (userId, amount, totalEarned, showNotification) => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      showNotification('Enter valid amount', 'error');
      return { success: false };
    }
    
    if (withdrawAmount > totalEarned) {
      showNotification('Insufficient balance', 'error');
      return { success: false };
    }
    
    try {
      const response = await earningsAPI.withdraw({ userId, amount: withdrawAmount });
      const data = await response.json();
      
      if (response.ok) {
        showNotification(`💰 Withdrawal of KSh ${withdrawAmount} initiated!`, 'success');
        return { success: true, amount: withdrawAmount };
      } else {
        showNotification(data.message || 'Withdrawal failed', 'error');
        return { success: false };
      }
    } catch (error) {
      showNotification('Withdrawal failed', 'error');
      return { success: false };
    }
  };

  return {
    callHistory,
    earningsHistory,
    fetchCallHistory,
    fetchEarningsHistory,
    purchaseTokens,
    withdrawEarnings
  };
};