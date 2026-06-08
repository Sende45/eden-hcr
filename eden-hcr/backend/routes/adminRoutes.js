import express from 'express';
import { getSuperAdminMetrics } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// On fait pointer les anciennes routes vers la fonction consolidée
router.get('/metrics', protect, getSuperAdminMetrics);
router.get('/dashboard/stats', protect, getSuperAdminMetrics); // Alias pour ton front
router.get('/missions', protect, getSuperAdminMetrics);       // Alias pour ton front

export default router;