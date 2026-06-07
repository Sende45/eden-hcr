import express from 'express';
import { addPlanningEntry } from '../controllers/planningController.js';

const router = express.Router();

router.post('/', addPlanningEntry);

export default router;