import express from 'express';
import { createMessage } from '../controllers/messagerieController.js';

const router = express.Router();

// Route : /api/messagerie
router.post('/', createMessage);

export default router;