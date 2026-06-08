import express from 'express';
import { getSuperAdminMetrics } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Si ton frontend appelle /api/admin/metrics
// Dans server.js tu as : app.use('/api/admin', adminRoutes);
// Donc ici, la route doit être juste '/metrics'
router.get('/metrics', protect, getSuperAdminMetrics);

export default router;