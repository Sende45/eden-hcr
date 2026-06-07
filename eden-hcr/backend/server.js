import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({
  // Autorise ton app Vite locale et ton futur domaine Vercel de production
  origin: ['http://localhost:5173', 'http://localhost:5174', '*'], 
  credentials: true
}));
app.use(express.json()); // Permet d'analyser le JSON entrant

// ==========================================
// CONNEXION À MONGODB ATLAS (OPTIMISÉE SERVERLESS)
// ==========================================
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return; // Évite de rouvrir une connexion à chaque appel d'API sur Vercel
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connection.readyState === 1;
    console.log(`[MongoDB] Connecté de façon serverless. Base active : ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Erreur] Échec de la connexion à MongoDB Atlas : ${error.message}`);
  }
};

// Middleware pour s'assurer que la base est connectée avant de traiter la route
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ==========================================
// ROUTE SANITAIRE DE TEST
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Le serveur backend serverless d EDÈN Group HCR est en ligne.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ==========================================
// LANCEMENT DU SERVEUR (HYBRIDE LOCAL / PROD)
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Local] Serveur lancé sur le port : ${PORT}`);
  });
}

// Indispensable pour que Vercel puisse charger l'application Express
export default app;