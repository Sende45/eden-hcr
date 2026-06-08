import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import messagerieRoutes from './routes/messagerieRoutes.js';
import candidatRoutes from './routes/candidatRoutes.js';
import etablissementRoutes from './routes/etablissementRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import contratsRoutes from './routes/contratsRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import paiementsRoutes from './routes/paiementsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

// ── Vérification des variables d'environnement ────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Démarrage EDÈN HCR API');
console.log('JWT_SECRET chargé :', !!process.env.JWT_SECRET);
console.log('MONGO_URI chargé :', !!process.env.MONGO_URI);
console.log('NODE_ENV :', process.env.NODE_ENV || 'non défini');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Rate limiting ──────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Trop de requêtes, réessayez plus tard.'
    }
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://eden-hcr.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Origine bloquée : ${origin}`);
    callback(new Error("Bloqué par la politique CORS d'EDÈN Group"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/messagerie', messagerieRoutes);
app.use('/api/candidat', candidatRoutes);
app.use('/api/etablissement', etablissementRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/contrats', contratsRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/admin', adminRoutes);

// ── MongoDB ────────────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI manquante.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`[MongoDB] Connecté : ${conn.connection.name}`);
    console.log(`[MongoDB] Host : ${conn.connection.host}`);
    console.log(`[MongoDB] ReadyState : ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('[Erreur MongoDB]');
    console.error(error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
};

connectDB();

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend EDÈN HCR opérationnel',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected'
  });
});

// ── Route racine ───────────────────────────────────────────────────────────────
app.all('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: "Bienvenue sur l'API EDÈN HCR"
  });
});

// ── Gestion des routes inconnues ──────────────────────────────────────────────
app.use((req, res) => {
  console.log(
    `[404] Route introuvable : ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    status: 'error',
    message: 'Route non définie'
  });
});

// ── Middleware global d'erreur ────────────────────────────────────────────────
app.use(errorHandler);

// ── Démarrage serveur ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 [Serveur] Port ${PORT}`);
});