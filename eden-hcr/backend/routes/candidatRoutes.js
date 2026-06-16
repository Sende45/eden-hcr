import express from 'express';

import {
  registerCandidat,
  updateCandidateStatus,
  searchCandidats
} from '../controllers/candidatController.js';

const router = express.Router();

router.post('/', registerCandidat);

router.patch('/:id/status', updateCandidateStatus);

router.get('/search', searchCandidats);

export default router;