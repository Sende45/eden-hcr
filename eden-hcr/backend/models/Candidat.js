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
    actif:           { type: Boolean, default: true },

    // ═══════════════════════════════════════════════════════════════════
    // ✅ AJOUTS POUR LE DASHBOARD CLIENT (sans impact sur l'existant)
    // ═══════════════════════════════════════════════════════════════════

    // ── Poste / Métier détaillé ──────────────────────────────────────
    poste: {
      type: String,
      default: '',
      trim: true,
      index: true // pour accélérer les recherches
    },

    // ── Ville (séparée de l'adresse pour faciliter les filtres) ─────
    ville: {
      type: String,
      default: '',
      trim: true,
      index: true
    },

    // ── Note agence (pour le système d'évaluation) ──────────────────
    noteAgence: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // ── Langues parlées ──────────────────────────────────────────────
    langues: {
      type: [String],
      default: [],
      index: true
    },

    // ── Photo de profil ──────────────────────────────────────────────
    photoProfil: {
      type: String,
      default: ''
    },

    // ── Statut pour le client (disponible, en mission, etc.) ────────
    statut: {
      type: String,
      enum: ['disponible', 'en_mission', 'indisponible', 'en_conge'],
      default: 'disponible',
      index: true
    },

    // ── Disponibilités en texte (complète les disponibilites Date) ──
    disponibilitesTexte: {
      type: String,
      default: '',
      trim: true
    },

    // ── Historique des notes des clients ────────────────────────────
    notesClients: [{
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note: { type: Number, min: 1, max: 5 },
      commentaire: { type: String, default: '' },
      missionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
      date: { type: Date, default: Date.now }
    }],

    // ── Dernière mise à jour du profil ──────────────────────────────
    derniereMiseAJour: {
      type: Date,
      default: Date.now
    },

    // ── Préférences de recherche ────────────────────────────────────
    preferences: {
      rayonRecherche: { type: Number, default: 30 }, // en km
      typesMission: { type: [String], default: [] },
      horairesPreferes: { type: [String], default: [] }
    },

    // ── Tags / catégories pour la recherche ─────────────────────────
    tags: {
      type: [String],
      default: [],
      index: true
    },

    // ── Disponibilité immédiate ─────────────────────────────────────
    disponibleImmediatement: {
      type: Boolean,
      default: false,
      index: true
    },

    // ── Score de fiabilité (calculé automatiquement) ───────────────
    scoreFiabilite: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  {
    timestamps: true,
    collection: 'candidat'
  }
);

// ═══════════════════════════════════════════════════════════════════════
// ✅ INDEX POUR OPTIMISER LES RECHERCHES DU DASHBOARD CLIENT
// ═══════════════════════════════════════════════════════════════════════

// Index composé pour les recherches fréquentes
candidatSchema.index({ 
  statut: 1, 
  poste: 1, 
  ville: 1, 
  noteAgence: -1 
});

// Index pour la recherche textuelle
candidatSchema.index({
  nom: 'text',
  prenom: 'text',
  poste: 'text',
  ville: 'text',
  competences: 'text',
  langues: 'text'
});

// Index pour les notes
candidatSchema.index({ noteAgence: -1, nombreMissions: -1 });

// ═══════════════════════════════════════════════════════════════════════
// ✅ MIDDLEWARE PRE-SAVE POUR METTRE À JOUR LE SCORE DE FIABILITÉ
// ═══════════════════════════════════════════════════════════════════════

candidatSchema.pre('save', function(next) {
  // Mettre à jour le score de fiabilité en fonction de plusieurs critères
  let score = 50;
  
  // Plus de missions = plus fiable
  if (this.nombreMissions > 0) {
    score += Math.min(this.nombreMissions * 2, 20);
  }
  
  // Note moyenne élevée
  if (this.noteMoyenne > 0) {
    score += Math.min(this.noteMoyenne * 5, 15);
  }
  
  // Documents fournis
  if (this.documents?.idCardUrl) score += 5;
  if (this.documents?.ribUrl) score += 5;
  if (this.documents?.vitaleCardUrl) score += 5;
  
  // Disponible immédiatement
  if (this.disponibleImmediatement) score += 5;
  
  // Score de fiabilité plafonné à 100
  this.scoreFiabilite = Math.min(Math.max(score, 0), 100);
  
  // Mettre à jour la date de dernière mise à jour
  this.derniereMiseAJour = new Date();
  
  next();
});

// ═══════════════════════════════════════════════════════════════════════
// ✅ MÉTHODE STATIQUE POUR LES RECHERCHES AVANCÉES
// ═══════════════════════════════════════════════════════════════════════

candidatSchema.statics.rechercheAvancee = async function({ 
  recherche, poste, ville, statut, noteMin, disponibleImmediatement 
}) {
  const query = { actif: true };
  
  // Recherche textuelle
  if (recherche && recherche.trim().length > 0) {
    query.$text = { $search: recherche };
  }
  
  // Filtres
  if (poste) query.poste = { $regex: poste, $options: 'i' };
  if (ville) query.ville = { $regex: ville, $options: 'i' };
  if (statut) query.statut = statut;
  if (noteMin) query.noteAgence = { $gte: parseFloat(noteMin) };
  if (disponibleImmediatement) query.disponibleImmediatement = true;
  
  return this.find(query)
    .sort({ noteAgence: -1, nombreMissions: -1 })
    .select('-documents -notesClients -preferences');
};

// ═══════════════════════════════════════════════════════════════════════
// ✅ MÉTHODE D'INSTANCE POUR METTRE À JOUR LA NOTE
// ═══════════════════════════════════════════════════════════════════════

candidatSchema.methods.ajouterNote = function(clientId, note, commentaire, missionId) {
  if (note < 1 || note > 5) {
    throw new Error('La note doit être comprise entre 1 et 5');
  }
  
  // Ajouter la note
  this.notesClients.push({
    clientId,
    note,
    commentaire: commentaire || '',
    missionId,
    date: new Date()
  });
  
  // Recalculer la note moyenne
  const notes = this.notesClients.map(n => n.note);
  this.noteMoyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
  
  // Mettre à jour la note agence (arrondie à 1 décimale)
  this.noteAgence = Math.round(this.noteMoyenne * 10) / 10;
  
  return this.save();
};

const Candidat = mongoose.model('Candidat', candidatSchema);

export default Candidat;