import { API_URL } from '../utils/constants';

export const getAgoraToken = async (channelName, uid) => {
  try {
    const response = await fetch(`${API_URL}/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, uid }),
    });
    const data = await response.json();
    if (!data.token || !data.appId) return null;
    return { token: data.token, appId: data.appId };
  } catch (error) {
    return null;
  }
};
