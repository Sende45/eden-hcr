import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(
    `[Serveur] Instance Express lancée sur le port ${PORT}`
  );
});