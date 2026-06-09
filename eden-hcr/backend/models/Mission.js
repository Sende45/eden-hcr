import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  etablissementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etablissement',
    required: [true, "L'établissement émetteur est obligatoire."]
  },

  posteRecherche: {
    type: String,
    required: [true, "Le poste recherché est obligatoire."],
    trim: true
  },

  dateDebut: {
    type: Date,
    required: [true, "La date et l'heure de début sont obligatoires."]
  },

  dateFin: {
    type: Date,
    required: [true, "La date et l'heure de fin sont obligatoires."]
  },

  nombreExtras: {
    type: Number,
    required: true,
    default: 1
  },

  tauxHoraireBrut: {
    type: Number,
    required: [true, "Le taux horaire brut proposé est obligatoire."]
  },

  tenueRequise: {
    type: String,
    trim: true
  },

  briefing: {
    type: String,
    trim: true
  },

  statutMission: {
    type: String,
    enum: [
      'ouverte',
      'repartie',
      'cloturee',
      'annulee'
    ],
    default: 'ouverte'
  },

  candidatsAssignes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat'
  }],

  // ──────────────────────────────────────────
  // AJOUTS EDÈN HCR
  // ──────────────────────────────────────────

  referenceMission: {
    type: String,
    unique: true,
    sparse: true
  },

  descriptionMission: {
    type: String,
    default: ''
  },

  lieuMission: {
    type: String,
    default: ''
  },

  villeMission: {
    type: String,
    default: ''
  },

  codePostalMission: {
    type: String,
    default: ''
  },

  contactSurPlace: {
    type: String,
    default: ''
  },

  telephoneContact: {
    type: String,
    default: ''
  },

  competencesRequises: {
    type: [String],
    default: []
  },

  experienceMinimum: {
    type: String,
    enum: [
      '',
      'sans_experience',
      '1_2_ans',
      '3_5_ans',
      'plus_5_ans'
    ],
    default: ''
  },

  candidatsPostulants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat'
  }],

  heuresPrevues: {
    type: Number,
    default: 0
  },

  montantMissionEstime: {
    type: Number,
    default: 0
  },

  validationAgence: {
    type: Boolean,
    default: false
  },

  missionUrgente: {
    type: Boolean,
    default: false
  },

  notesInternes: {
    type: String,
    default: ''
  },

  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  archivee: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  collection: 'mission'
});

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;