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
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import du middleware d'erreur centralisé
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// RATE LIMITING
// ==========================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    message: 'Trop de requêtes effectuées depuis cette adresse IP, réessayez plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ==========================================
// CONFIGURATION CORS
// ==========================================
const allowedOrigins = [
  'https://eden-hcr.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Bloqué par la politique CORS d'EDÈN Group"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ FIX : wildcard *splat compatible path-to-regexp v8 (remplace l'ancien *)
app.options('*splat', cors());

app.use(express.json());

// ==========================================
// ROUTES DE L'API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/messagerie', messagerieRoutes);
app.use('/api/candidat', candidatRoutes);
app.use('/api/etablissement', etablissementRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/contrats', contratsRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// CONNEXION MONGODB
// ==========================================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI manquante dans les variables d'environnement.");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connecté avec succès. Base active : ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Erreur MongoDB] ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ==========================================
// ROUTE SANTÉ
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend EDÈN HCR opérationnel',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// ==========================================
// MIDDLEWARE ERREUR GLOBAL
// ==========================================
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Serveur] Instance Express lancée sur le port ${PORT}`);
});