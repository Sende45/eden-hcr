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
    enum: ['genere', 'signe_extra', 'valide_agence', 'annule'],
    default: 'genere'
  },
  dateSignatureExtra: {
    type: Date
  },
  documentUrl: {
    type: String,
    default: "" // Lien vers le document PDF généré
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'contrats'
});

export default mongoose.model('Contrats', contratsSchema);