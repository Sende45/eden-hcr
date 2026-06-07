import mongoose from 'mongoose';

const candidatSchema = new mongoose.Schema({
  civilite: {
    type: String,
    enum: ['M.', 'Mme'],
    required: [true, "La civilité est obligatoire."]
  },
  nom: {
    type: String,
    required: [true, "Le nom est obligatoire."],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, "Le prénom est obligatoire."],
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
    required: [true, "Le numéro de téléphone est obligatoire."],
    trim: true
  },
  adresse: {
    ville: { type: String, required: [true, "La ville est obligatoire."] },
    codePostal: { type: String, required: [true, "Le code postal est obligatoire."] }
  },
  metier: {
    type: String,
    required: [true, "Le métier/poste recherché est obligatoire."]
  },
  experience: {
    type: String,
    enum: ['sans_experience', '1_2_ans', '3_5_ans', 'plus_5_ans'],
    required: [true, "Le niveau d'expérience est obligatoire."]
  },
  competences: {
    type: [String],
    default: []
  },
  cvUrl: {
    type: String,
    default: "" // Stockage de la pièce jointe (Firebase/Cloudinary) plus tard
  },
  statutValidation: {
    type: String,
    enum: ['en_attente', 'approuve', 'rejete'],
    default: 'en_attente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'candidat'
});

const Candidat = mongoose.model('Candidat', candidatSchema);
export default Candidat;