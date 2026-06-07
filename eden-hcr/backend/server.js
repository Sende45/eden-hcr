import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Chargement des variables d'environnement (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({
  // Autorise tes ports locaux et accepte toutes les requêtes en production
  origin: ['http://localhost:5173', 'http://localhost:5174', '*'], 
  credentials: true
}));
app.use(express.json()); // Analyse du JSON entrant

// ==========================================
// CONNEXION ROBUSTE À MONGODB ATLAS
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connecté de manière permanente. Base active : ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Erreur] Échec critique de la connexion à MongoDB Atlas : ${error.message}`);
    process.exit(1); // Arrêt propre du conteneur en cas d'échec de liaison
  }
};

// Lancement de la connexion
connectDB();

// ==========================================
// ROUTE SANITAIRE DE TEST
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Le serveur backend d EDÈN Group HCR est en ligne sur Render.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ==========================================
// LANCEMENT PERMANENT DU SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log(`[Serveur] Instance Express lancée avec succès sur le port : ${PORT}`);
});