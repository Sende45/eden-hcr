import mongoose from 'mongoose';

const paiementsSchema = new mongoose.Schema(
  {
    contratId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contrats',
      required: true
    },

    candidatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat',
      required: true
    },

    // ============================
    // AJOUTS
    // ============================

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    montantBrut: {
      type: Number,
      required: true
    },

    montantNetA_Payer: {
      type: Number,
      required: true
    },

    // Détail du calcul de paie
    heuresTravaillees: {
      type: Number,
      default: 0
    },

    tauxHoraireBrut: {
      type: Number,
      default: 0
    },

    primes: {
      type: Number,
      default: 0
    },

    indemnites: {
      type: Number,
      default: 0
    },

    retenues: {
      type: Number,
      default: 0
    },

    montantCharges: {
      type: Number,
      default: 0
    },

    statutVersement: {
      type: String,
      enum: [
        'en_attente',
        'traite',
        'echoue',
        'annule'
      ],
      default: 'en_attente'
    },

    modePaiement: {
      type: String,
      enum: [
        'virement',
        'cheque',
        'especes'
      ],
      default: 'virement'
    },

    dateVersementEffectif: {
      type: Date
    },

    transactionReference: {
      type: String,
      default: ''
    },

    banqueReference: {
      type: String,
      default: ''
    },

    bulletinPaieUrl: {
      type: String,
      default: ''
    },

    commentaire: {
      type: String,
      default: ''
    },

    generePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'paiements'
  }
);

const Paiements = mongoose.model('Paiements', paiementsSchema);

export default Paiements;