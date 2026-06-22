import express from 'express';
import {
  createMessage,
  getNotifications,
  getAdminChannels,
  getOrCreateChannel,
  sendChannelMessage
} from '../controllers/messagerieController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/',             createMessage);
router.get('/notifications', protect, getNotifications);

// Channels
router.get('/channels',              protect, getAdminChannels);
router.get('/channels/:userId',      protect, getOrCreateChannel);
router.post('/channels/:channelId',  protect, sendChannelMessage);

export default router;