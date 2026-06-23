import express from 'express';
import { processPaiementRecord, getPaiementsByCandidat } from '../controllers/paiementsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', processPaiementRecord);
router.get('/candidat/:id', protect, getPaiementsByCandidat);

export default router;