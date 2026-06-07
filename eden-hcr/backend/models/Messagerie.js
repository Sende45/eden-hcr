import mongoose from 'mongoose';

const messagerieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de l'expéditeur est obligatoire."],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'adresse email est obligatoire."],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Veuillez fournir une adresse email valide."
    ]
  },
  subject: {
    type: String,
    required: [true, "Le sujet du message est obligatoire."],
    trim: true
  },
  message: {
    type: String,
    required: [true, "Le contenu du message est obligatoire."],
    trim: true
  },
  lu: {
    type: Boolean,
    default: false // Permet à ton futur tableau de bord admin de filtrer les nouveaux messages
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'messagerie' // Cible exactement le nom de ta collection sur Atlas
});

const Messagerie = mongoose.model('Messagerie', messagerieSchema);
export default Messagerie;