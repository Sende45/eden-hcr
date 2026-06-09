import mongoose from 'mongoose';

const rapportSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true // ex: mensuel, performance, financier
    },

    contenu: {
      type: String
    },

    // ============================
    // AJOUTS
    // ============================

    candidatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    },

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },

    generePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    visibilite: {
      type: String,
      enum: ['admin', 'superadmin', 'extra'],
      default: 'admin'
    },

    statut: {
      type: String,
      enum: ['brouillon', 'publie', 'archive'],
      default: 'publie'
    },

    fichierUrl: {
      type: String,
      default: ''
    },

    noteGlobale: {
      type: Number,
      default: 0
    },

    observations: {
      type: String,
      default: ''
    },

    dateGeneration: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'rapports'
  }
);

const Rapport = mongoose.model('Rapport', rapportSchema);

export default Rapport;