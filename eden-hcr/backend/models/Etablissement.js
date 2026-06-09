import mongoose from 'mongoose';

const etablissementSchema = new mongoose.Schema(
  {
    raisonSociale: {
      type: String,
      required: [true, "La raison sociale est obligatoire."],
      trim: true
    },

    siret: {
      type: String,
      required: [true, "Le numéro SIRET est obligatoire."],
      unique: true,
      trim: true
    },

    typeEtablissement: {
      type: String,
      enum: [
        'palace',
        'hotel_luxe',
        'brasserie',
        'bistrot',
        'traiteur_event'
      ],
      required: [true, "Le type d'établissement est obligatoire."]
    },

    contactInterne: {
      nom: {
        type: String,
        required: true,
        trim: true
      },

      prenom: {
        type: String,
        required: true,
        trim: true
      },

      poste: {
        type: String,
        required: true,
        trim: true
      },

      telephone: {
        type: String,
        required: true,
        trim: true
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      }
    },

    adresse: {
      rue: {
        type: String,
        required: true
      },

      ville: {
        type: String,
        required: true
      },

      codePostal: {
        type: String,
        required: true
      }
    },

    // ============================
    // AJOUTS
    // ============================

    telephonePrincipal: {
      type: String,
      default: ''
    },

    emailPrincipal: {
      type: String,
      lowercase: true,
      default: ''
    },

    siteWeb: {
      type: String,
      default: ''
    },

    logoUrl: {
      type: String,
      default: ''
    },

    description: {
      type: String,
      default: ''
    },

    nombreMissionsPubliees: {
      type: Number,
      default: 0
    },

    nombreExtrasDemandes: {
      type: Number,
      default: 0
    },

    nombreExtrasEmployes: {
      type: Number,
      default: 0
    },

    tauxHoraireMoyen: {
      type: Number,
      default: 0
    },

    noteMoyenne: {
      type: Number,
      default: 0
    },

    secteurActivite: {
      type: String,
      default: 'Hôtellerie & Restauration'
    },

    facturationAdresse: {
      type: String,
      default: ''
    },

    iban: {
      type: String,
      default: ''
    },

    bic: {
      type: String,
      default: ''
    },

    responsableCompte: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    missions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mission'
      }
    ],

    statutCompte: {
      type: String,
      enum: [
        'en_attente_validation',
        'actif',
        'suspendu'
      ],
      default: 'en_attente_validation'
    },

    dateValidation: {
      type: Date
    },

    commentaireInterne: {
      type: String,
      default: ''
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'etablissement'
  }
);

const Etablissement = mongoose.model(
  'Etablissement',
  etablissementSchema
);

export default Etablissement;