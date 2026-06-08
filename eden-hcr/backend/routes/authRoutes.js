import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// Ajout de la route manquante pour récupérer le profil utilisateur
router.get('/me', protect, getMe);

export default router;