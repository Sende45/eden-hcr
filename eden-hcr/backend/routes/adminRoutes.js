import express from 'express';
import { 
  getSuperAdminMetrics, 
  getCandidates, 
  getEstablishments 
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Métriques consolidées ────────────────────────────────────────────────────
router.get('/metrics', protect, getSuperAdminMetrics);
router.get('/dashboard/stats', protect, getSuperAdminMetrics);
router.get('/missions', protect, getSuperAdminMetrics);

// ── Gestion des ressources (Candidats et Établissements) ──────────────────────
router.get('/candidates', protect, getCandidates);
router.get('/establishments', protect, getEstablishments);

export default router;