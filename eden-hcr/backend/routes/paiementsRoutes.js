import express from 'express';
import { processPaiementRecord } from '../controllers/paiementsController.js';

const router = express.Router();

router.post('/', processPaiementRecord);

export default router;