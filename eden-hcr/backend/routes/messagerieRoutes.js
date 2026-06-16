import express from 'express';

import {
  createMessage,
  getNotifications
} from '../controllers/messagerieController.js';

const router = express.Router();

router.post('/', createMessage);

router.get('/notifications', getNotifications);

export default router;