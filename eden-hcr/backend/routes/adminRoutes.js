import express from 'express';
import { 
  getSuperAdminMetrics, 
  getCandidates, 
  getEstablishments,
  getPlanningData,
  getContrats,
  getReports,
  getPayments,
  getMessages,
  sendMessage,
  updateCandidateStatus
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

// ── NOUVELLES ROUTES (Planning, Contrats, Rapports, Paiements, Messagerie) ──
router.get('/planning', protect, getPlanningData);
router.get('/contracts', protect, getContrats);
router.get('/reports', protect, getReports);
router.get('/payments', protect, getPayments);
router.get('/messages/channels', protect, getMessages);
router.post('/messages/channels/:channelId', protect, sendMessage);
router.patch('/candidates/:id/status', updateCandidateStatus);
router.put('/candidates/:id/status', updateCandidateStatus);
export default router;