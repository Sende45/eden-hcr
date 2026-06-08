import express from 'express';
import { createMission, getMissionsOuvertes } from '../controllers/missionController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Import du verrou

const router = express.Router();

// Maintenant, il faut un Token JWT valide pour créer ou voir les missions
router.post('/', protect, createMission);
router.get('/ouvertes', protect, getMissionsOuvertes);

export default router;