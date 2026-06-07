import express from 'express';
import { createMission, getMissionsOuvertes } from '../controllers/missionController.js';

const router = express.Router();

router.post('/', createMission);
router.get('/ouvertes', getMissionsOuvertes);

export default router;