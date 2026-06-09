import mongoose from 'mongoose';

const planningSchema = new mongoose.Schema({
  candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: [true, "Le candidat est obligatoire."]
  },

  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, "La mission associée est obligatoire."]
  },

  dateShift: {
    type: Date,
    required: true
  },

  heureDebutEffective: {
    type: String,
    required: true
  },

  heureFinEffective: {
    type: String,
    required: true
  },

  statutEmargement: {
    type: String,
    enum: [
      'planifie',
      'valide_extra',
      'approuve_etablissement',
      'litige'
    ],
    default: 'planifie'
  },

  heuresTotalesRealisees: {
    type: Number,
    default: 0
  },

  // ──────────────────────────────────────────
  // AJOUTS EDÈN HCR
  // ──────────────────────────────────────────

  referencePlanning: {
    type: String,
    unique: true,
    sparse: true
  },

  statutPresence: {
    type: String,
    enum: [
      'planifie',
      'present',
      'absent',
      'retard',
      'annule'
    ],
    default: 'planifie'
  },

  heureArrivee: {
    type: String,
    default: ''
  },

  heureDepart: {
    type: String,
    default: ''
  },

  pauseMinutes: {
    type: Number,
    default: 0
  },

  heuresFacturees: {
    type: Number,
    default: 0
  },

  montantBrutMission: {
    type: Number,
    default: 0
  },

  commentaireExtra: {
    type: String,
    default: ''
  },

  commentaireAgence: {
    type: String,
    default: ''
  },

  commentaireEtablissement: {
    type: String,
    default: ''
  },

  validationExtra: {
    type: Boolean,
    default: false
  },

  validationAgence: {
    type: Boolean,
    default: false
  },

  validationEtablissement: {
    type: Boolean,
    default: false
  },

  dateValidationExtra: {
    type: Date
  },

  dateValidationAgence: {
    type: Date
  },

  dateValidationEtablissement: {
    type: Date
  },

  geolocalisationArrivee: {
    latitude: Number,
    longitude: Number
  },

  geolocalisationDepart: {
    latitude: Number,
    longitude: Number
  },

  litigeOuvert: {
    type: Boolean,
    default: false
  },

  motifLitige: {
    type: String,
    default: ''
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
  collection: 'planning'
});

const Planning = mongoose.model('Planning', planningSchema);

export default Planning;