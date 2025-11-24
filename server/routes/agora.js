const express = require('express');
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Generate Agora Token
router.post('/token', async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log('Token request received for channel:', channelName, 'uid:', uid);
    console.log('Using appId:', appId);

    if (!appId || !appCertificate) {
      console.error('Missing Agora credentials');
      return res.status(400).json({ message: 'Agora credentials not configured' });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    console.log('Token generated successfully');

    res.json({
      token: token,
      appId: appId,
      channelName: channelName,
      uid: uid,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;