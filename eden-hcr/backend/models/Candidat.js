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
      ville: {
        type: String,
        default: ''
      },

      codePostal: {
        type: String,
        default: ''
      }
    },

    metier: {
      type: String,
      default: ''
    },

    experience: {
      type: String,
      enum: [
        'sans_experience',
        '1_2_ans',
        '3_5_ans',
        'plus_5_ans'
      ],
      default: 'sans_experience'
    },

    competences: {
      type: [String],
      default: []
    },

    cvUrl: {
      type: String,
      default: ''
    },

    statutValidation: {
      type: String,
      enum: [
        'en_attente',
        'approuve',
        'rejete'
      ],
      default: 'en_attente'
    },

    disponibilites: {
      type: [Date],
      default: []
    },

    noteMoyenne: {
      type: Number,
      default: 0
    },

    nombreMissions: {
      type: Number,
      default: 0
    },

    // NOUVEAU CHAMP
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'rejected'],
      default: 'pending'
    },

    actif: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'candidat'
  }
);

const Candidat = mongoose.model('Candidat', candidatSchema);

export default Candidat;