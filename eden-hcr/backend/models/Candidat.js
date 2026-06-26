import mongoose from 'mongoose';

const candidatSchema = new mongoose.Schema(
  {
    civilite: {
      type: String,
      enum: ['M.', 'Mme'],
      default: 'M.'
    },

    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire.'],
      trim: true
    },

    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire.'],
      trim: true
    },

    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true
    },

    telephone: {
      type: String,
      default: ''
    },

    adresse: {
      ville:     { type: String, default: '' },
      codePostal:{ type: String, default: '' }
    },

    metier:     { type: String, default: '' },

    experience: {
      type: String,
      enum: ['sans_experience', '1_2_ans', '3_5_ans', 'plus_5_ans'],
      default: 'sans_experience'
    },

    competences:  { type: [String], default: [] },
    cvUrl:        { type: String, default: '' },

    // ── Nationalité & titre de séjour ─────────────────────────────────
    nationalite: {
      type: String,
      enum: ['francais', 'ue', 'etranger', ''],
      default: ''
    },

    titreSejour: {
      type: {
        type: String,
        default: ''
      },
      dateExpiration: {
        type: Date,
        default: null
      }
    },

    // ── Documents réglementaires ──────────────────────────────────────
    documents: {
      idCardUrl:       { type: String, default: '' },
      vitaleCardUrl:   { type: String, default: '' },
      ribUrl:          { type: String, default: '' },
      titreSejourUrl:  { type: String, default: '' },
      // Dates d'upload pour traçabilité
      idCardUploadedAt:      { type: Date, default: null },
      vitaleCardUploadedAt:  { type: Date, default: null },
      ribUploadedAt:         { type: Date, default: null },
      titreSejourUploadedAt: { type: Date, default: null },
    },

    statutValidation: {
      type: String,
      enum: ['en_attente', 'approuve', 'rejete'],
      default: 'en_attente'
    },

    status: {
      type: String,
      enum: ['pending', 'validated', 'premium', 'inactive', 'rejected'],
      default: 'pending'
    },

    disponibilites:  { type: [Date], default: [] },
    noteMoyenne:     { type: Number, default: 0 },
    nombreMissions:  { type: Number, default: 0 },
    actif:           { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'candidat'
  }
);

const Candidat = mongoose.model('Candidat', candidatSchema);

export default Candidat;