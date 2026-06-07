import express from 'express';
import { registerEtablissement } from '../controllers/etablissementController.js';

const router = express.Router();

router.post('/register', registerEtablissement);

export default router;