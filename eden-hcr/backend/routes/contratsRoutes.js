import express from 'express';
import { createContrat, getContratsByCandidat } from '../controllers/contratsController.js';

const router = express.Router();

router.post('/', createContrat);
router.get('/candidat/:candidatId', getContratsByCandidat);

export default router;