import express from 'express';
import { createContrat, getContratsByCandidat } from '../controllers/contratsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Seuls les utilisateurs connectés peuvent manipuler les contrats
router.post('/', protect, createContrat);
router.get('/candidat/:candidatId', protect, getContratsByCandidat);

export default router;