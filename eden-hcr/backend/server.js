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
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Autorise ton app Vite
  credentials: true
}));
app.use(express.json()); // Permet d'analyser le JSON entrant

// ==========================================
// CONNEXION À MONGODB ATLAS
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connecté avec succès au Cluster Atlas. Base active : ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Erreur] Échec de la connexion à MongoDB Atlas : ${error.message}`);
    process.exit(1); // Arrêt propre en cas de crash
  }
};

connectDB();

// ==========================================
// ROUTE SANITAIRE DE TEST
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Le serveur backend d EDÈN Group HCR est en ligne.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ==========================================
// LANCEMENT DU SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log(`[Serveur] Lancé sur le port : ${PORT}`);
});