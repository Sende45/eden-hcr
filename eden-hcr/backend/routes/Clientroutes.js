import express from 'express';
import { getCandidatsPourClients } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware local : vérifie que l'utilisateur est bien un client (ou admin)
const clientOnly = (req, res, next) => {
  const allowed = ['client', 'admin', 'superadmin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Accès réservé aux clients EDÈN.'
    });
  }
  next();
};

// GET /api/clients/candidats
router.get('/candidats', protect, clientOnly, getCandidatsPourClients);

export default router;