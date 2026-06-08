import mongoose from 'mongoose';

const rapportSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  type: { type: String, required: true }, // ex: 'mensuel', 'performance'
  contenu: { type: String },
  dateGeneration: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Rapport', rapportSchema);