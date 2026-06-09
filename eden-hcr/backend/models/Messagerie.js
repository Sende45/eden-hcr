import mongoose from 'mongoose';

const messagerieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'expéditeur est obligatoire."],
      trim: true
    },

    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire."],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir une adresse email valide."
      ]
    },

    subject: {
      type: String,
      required: [true, "Le sujet du message est obligatoire."],
      trim: true
    },

    message: {
      type: String,
      required: [true, "Le contenu du message est obligatoire."],
      trim: true
    },

    // ============================
    // AJOUTS
    // ============================

    expediteurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    destinataireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    candidatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    },

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },

    contratId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contrats'
    },

    typeMessage: {
      type: String,
      enum: [
        'general',
        'mission',
        'contrat',
        'planning',
        'paiement',
        'support'
      ],
      default: 'general'
    },

    priorite: {
      type: String,
      enum: [
        'faible',
        'normale',
        'haute',
        'urgente'
      ],
      default: 'normale'
    },

    pieceJointeUrl: {
      type: String,
      default: ''
    },

    pieceJointeNom: {
      type: String,
      default: ''
    },

    reponseA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Messagerie'
    },

    archive: {
      type: Boolean,
      default: false
    },

    supprime: {
      type: Boolean,
      default: false
    },

    lu: {
      type: Boolean,
      default: false
    },

    dateLecture: {
      type: Date
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'messagerie'
  }
);

const Messagerie = mongoose.model('Messagerie', messagerieSchema);

export default Messagerie;