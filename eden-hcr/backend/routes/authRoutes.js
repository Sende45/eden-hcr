import express from 'express';
import {
  registerUser,
  loginUser,
  getMe
} from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * AUTHENTIFICATION
 */

// Inscription d'un prestataire / utilisateur
router.post('/register', registerUser);

// Connexion
router.post('/login', loginUser);

// Profil utilisateur connecté
router.get('/me', protect, getMe);

export default router;