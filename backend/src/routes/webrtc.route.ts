import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

// Get TURN/STUN server configuration
router.route('/ice-servers').get(verifyJWT, (req, res) => {
  // In production, you would use actual TURN servers
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // For production, add TURN servers:
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'your-username',
    //   credential: 'your-password'
    // }
  ];

  res.json({
    success: true,
    data: { iceServers },
    message: 'ICE servers retrieved successfully'
  });
});

// Get call statistics
router.route('/stats').get(verifyJWT, (req, res) => {
  // This would be populated by the WebSocket server
  res.json({
    success: true,
    data: {
      message: 'Use WebSocket connection to get real-time stats'
    }
  });
});

export default router;