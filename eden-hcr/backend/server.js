import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// ==========================================
// IMPORTS DES ROUTES
// ==========================================
import messagerieRoutes from './routes/messagerieRoutes.js';
import candidatRoutes from './routes/candidatRoutes.js';
import etablissementRoutes from './routes/etablissementRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import contratsRoutes from './routes/contratsRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import paiementsRoutes from './routes/paiementsRoutes.js';

// Import du middleware d'erreur centralisé
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Limitation des requêtes pour sécuriser la production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: {
    status: 'error',
    message: 'Trop de requêtes effectuées depuis cette adresse IP, réessayez plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// ==========================================
// ROUTES DE L'API
// ==========================================
app.use('/api/messagerie', messagerieRoutes);
app.use('/api/candidat', candidatRoutes);
app.use('/api/etablissement', etablissementRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/contrats', contratsRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/paiements', paiementsRoutes);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI manquante dans les variables d’environnement.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `[MongoDB] Connecté avec succès. Base active : ${conn.connection.name}`
    );
  } catch (error) {
    console.error(
      `[Erreur MongoDB] ${error.message}`
    );
    process.exit(1);
  }
};

connectDB();

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend EDÈN HCR opérationnel',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
  });
});

// Middleware d'erreur global (doit impérativement être placé après toutes les routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `[Serveur] Instance Express lancée sur le port ${PORT}`
  );
});