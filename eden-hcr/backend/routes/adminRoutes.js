import express from 'express';
import { getSuperAdminMetrics } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route sécurisée par JWT
router.get('/metrics', protect, getSuperAdminMetrics);

export default router;