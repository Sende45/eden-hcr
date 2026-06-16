import express from 'express';
import {
  registerCandidat,
  updateCandidateStatus
} from '../controllers/candidatController.js';

const router = express.Router();

// Route : /api/candidat
router.post('/', registerCandidat);

// Route : PATCH /api/candidat/:id/status
router.patch('/:id/status', updateCandidateStatus);

export default router;