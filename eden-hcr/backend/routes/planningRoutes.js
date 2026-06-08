import express from 'express';
import { addPlanningEntry } from '../controllers/planningController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Inscription sécurisée d'un shift
router.post('/', protect, addPlanningEntry);

export default router;