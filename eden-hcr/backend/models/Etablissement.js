import mongoose from 'mongoose';

const etablissementSchema = new mongoose.Schema({
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
    enum: ['palace', 'hotel_luxe', 'brasserie', 'bistrot', 'traiteur_event'],
    required: [true, "Le type d'établissement est obligatoire."]
  },
  contactInterne: {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    poste: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  adresse: {
    rue: { type: String, required: true },
    ville: { type: String, required: true },
    codePostal: { type: String, required: true }
  },
  statutCompte: {
    type: String,
    enum: ['en_attente_validation', 'actif', 'suspendu'],
    default: 'en_attente_validation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'etablissement'
});

export default mongoose.model('Etablissement', etablissementSchema);