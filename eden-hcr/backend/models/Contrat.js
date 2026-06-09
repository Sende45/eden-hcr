import mongoose from 'mongoose';

const contratsSchema = new mongoose.Schema({
  candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: [true, "Le candidat signataire est obligatoire."]
  },

  etablissementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etablissement',
    required: [true, "L'établissement d'accueil est obligatoire."]
  },

  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, "La mission de référence est obligatoire."]
  },

  typeContrat: {
    type: String,
    default: "Extra / CDD d'usage (CDDU)"
  },

  statutSignature: {
    type: String,
    enum: [
      'genere',
      'signe_extra',
      'valide_agence',
      'annule'
    ],
    default: 'genere'
  },

  dateSignatureExtra: {
    type: Date
  },

  documentUrl: {
    type: String,
    default: ""
  },

  // ─────────────────────────────────────────────
  // AJOUTS EDÈN HCR
  // ─────────────────────────────────────────────

  numeroContrat: {
    type: String,
    unique: true,
    sparse: true
  },

  dateDebutMission: {
    type: Date
  },

  dateFinMission: {
    type: Date
  },

  tauxHoraireBrut: {
    type: Number,
    default: 0
  },

  heuresPrevues: {
    type: Number,
    default: 0
  },

  montantEstimeBrut: {
    type: Number,
    default: 0
  },

  signatureElectronique: {
    type: Boolean,
    default: false
  },

  ipSignature: {
    type: String,
    default: ''
  },

  appareilSignature: {
    type: String,
    default: ''
  },

  commentaireAgence: {
    type: String,
    default: ''
  },

  commentaireExtra: {
    type: String,
    default: ''
  },

  dateValidationAgence: {
    type: Date
  },

  validePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  archive: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  collection: 'contrats'
});

const Contrats = mongoose.model('Contrats', contratsSchema);

export default Contrats;