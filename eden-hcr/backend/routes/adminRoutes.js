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
  getChannelMessages, // <-- AJOUT
  sendMessage,
  updateCandidateStatus,
  getMissions
} from '../controllers/adminController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// MÉTRIQUES SUPER ADMIN
// ─────────────────────────────────────────────────────────────

// Route principale
router.get('/metrics', protect, getSuperAdminMetrics);

// Compatibilité avec différents dashboards
router.get('/dashboard/stats', protect, getSuperAdminMetrics);
router.get('/dashboard-stats', protect, getSuperAdminMetrics);
router.get('/stats', protect, getSuperAdminMetrics);

// Conservation de la route actuelle
router.get('/missions', protect, getMissions);

// ─────────────────────────────────────────────────────────────
// CANDIDATS
// ─────────────────────────────────────────────────────────────

router.get('/candidates', protect, getCandidates);

router.patch('/candidates/:id/status', protect, updateCandidateStatus);
router.put('/candidates/:id/status', protect, updateCandidateStatus);

// ─────────────────────────────────────────────────────────────
// ÉTABLISSEMENTS
// ─────────────────────────────────────────────────────────────

router.get('/establishments', protect, getEstablishments);

// ─────────────────────────────────────────────────────────────
// PLANNING
// ─────────────────────────────────────────────────────────────

router.get('/planning', protect, getPlanningData);

// ─────────────────────────────────────────────────────────────
// CONTRATS
// ─────────────────────────────────────────────────────────────

router.get('/contracts', protect, getContrats);

// ─────────────────────────────────────────────────────────────
// RAPPORTS
// ─────────────────────────────────────────────────────────────

router.get('/reports', protect, getReports);

// ─────────────────────────────────────────────────────────────
// PAIEMENTS
// ─────────────────────────────────────────────────────────────

router.get('/payments', protect, getPayments);

// ─────────────────────────────────────────────────────────────
// MESSAGERIE
// ─────────────────────────────────────────────────────────────

router.get(
  '/messages/channels/:channelId',
  protect,
  getChannelMessages
);

router.post(
  '/messages/channels/:channelId',
  protect,
  sendMessage
);

export default router;