import express from 'express';
import { registerCandidat } from '../controllers/candidatController.js';

const router = express.Router();

// Route : /api/candidat
router.post('/', registerCandidat);

export default router;