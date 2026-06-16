import express from 'express';
import {
  createMission,
  getMissionsOuvertes,
  searchMissions
} from '../controllers/missionController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createMission);

router.get('/ouvertes', protect, getMissionsOuvertes);

router.get('/search', protect, searchMissions);

export default router;