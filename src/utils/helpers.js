// Helper functions
export const getRandomOnlineCount = () => ({
  clients: Math.floor(Math.random() * 50) + 20,
});

export const parseUserId = (profile) => {
  return typeof profile.userId === 'object' ? profile.userId._id : profile.userId;
};
