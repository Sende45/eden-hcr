import express from 'express';
import { getSuperAdminMetrics } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// On utilise le contrôleur getSuperAdminMetrics que tu as déjà défini
// et qui contient toute ta logique (aggregate, countDocuments, etc.)
router.get('/metrics', protect, getSuperAdminMetrics);

export default router;