import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Imports corrigés - Vérifiez que vos fichiers sont bien dans le dossier routes/
import messagerieRoutes from './routes/messagerieRoutes.js';
import candidatRoutes from './routes/candidatRoutes.js';
import etablissementRoutes from './routes/etablissementRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import contratsRoutes from './routes/contratsRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import paiementsRoutes from './routes/paiementsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

// ── Configuration ES Modules ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ── CORS AMÉLIORÉ ─── EN PREMIER, AVANT TOUT ──────────────────────────────────
const allowedOrigins = [
  'https://app.eden-group.co',
  'https://eden-hcr.vercel.app',
  'https://eden-hcr-backend.onrender.com',
  'https://eden-hcr.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (appels serveur, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // En développement, tout est autorisé
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permettre les sous-domaines Render en production
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    console.warn(`[CORS] ❌ Origine bloquée : ${origin}`);
    callback(new Error("Bloqué par la politique CORS d'EDÈN Group"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Length', 'X-Requested-With']
};

// Appliquer CORS
app.use(cors(corsOptions));

// ✅ Répondre à TOUTES les pré-requêtes OPTIONS
app.options('*', cors(corsOptions));

// ✅ Middleware de logging pour debugger les requêtes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// ── Rate limiting ─── APRÈS CORS ─────────────────────────────────────────────
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

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Route de test pour debug ──────────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '✅ API EDÈN HCR est en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: [
      '/api/auth',
      '/api/clients/candidats',
      '/api/mission',
      '/api/contrats',
      '/api/messagerie',
      '/api/health'
    ]
  });
});

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
app.use('/api/clients', clientRoutes);

// ✅ Route de vérification des routes enregistrées
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  try {
    // Parcourir l'application pour récupérer les routes enregistrées
    if (app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          routes.push({
            path: layer.route.path,
            methods: methods
          });
        }
        // Vérifier les routers
        if (layer.name === 'router' && layer.handle && layer.handle.stack) {
          const basePath = layer.regexp.source
            .replace(/\\\/\?/g, '/')
            .replace(/\\/g, '')
            .replace(/\^/g, '')
            .replace(/\?\(\?=\/\|$\)/g, '')
            .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, '');
          
          layer.handle.stack.forEach((subLayer) => {
            if (subLayer.route) {
              const methods = Object.keys(subLayer.route.methods).join(', ').toUpperCase();
              const fullPath = (basePath + subLayer.route.path).replace(/\/\//g, '/');
              routes.push({
                path: fullPath,
                methods: methods
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('[Routes] Erreur lors de la récupération des routes:', error.message);
  }
  
  res.status(200).json({
    status: 'success',
    totalRoutes: routes.length,
    routes: routes.slice(0, 50) // Limiter pour lisibilité
  });
});

// ── MongoDB ────────────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI manquante.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[MongoDB] ✅ Connecté : ${conn.connection.name}`);
    console.log(`[MongoDB] Host : ${conn.connection.host}`);
    console.log(`[MongoDB] ReadyState : ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('[Erreur MongoDB] ❌');
    console.error(error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // En production, ne pas exit le processus mais logger l'erreur
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️ MongoDB non connecté - certaines fonctionnalités seront indisponibles');
    } else {
      process.exit(1);
    }
  }
};

connectDB();

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: '❌ Disconnected',
    1: '✅ Connected',
    2: '🔄 Connecting',
    3: '🔄 Disconnecting'
  }[dbStatus] || '❌ Unknown';

  res.status(200).json({
    status: 'success',
    message: 'Backend EDÈN HCR opérationnel',
    database: dbStatusText,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── Route racine ───────────────────────────────────────────────────────────────
app.all('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: "Bienvenue sur l'API EDÈN HCR",
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      routes: '/api/routes',
      clients: '/api/clients/candidats',
      auth: '/api/auth',
      mission: '/api/mission'
    }
  });
});

// ── Gestion des routes inconnues ──────────────────────────────────────────────
app.use((req, res) => {
  console.log(`[404] ❌ Route introuvable : ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'Route non définie',
    requested: {
      method: req.method,
      url: req.originalUrl
    }
  });
});

// ── Middleware global d'erreur ────────────────────────────────────────────────
app.use(errorHandler);

// ── Gestion des erreurs non capturées ─────────────────────────────────────────
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    // En production, logger et continuer
    console.error('⚠️ Erreur non capturée - le serveur continue de tourner');
  } else {
    process.exit(1);
  }
});

// ── Démarrage serveur ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 [Serveur] Port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Routes: http://localhost:${PORT}/api/routes`);
});

export default app;