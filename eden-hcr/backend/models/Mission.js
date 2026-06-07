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
    enum: ['ouverte', 'repartie', 'cloturee', 'annulee'],
    default: 'ouverte'
  },
  candidatsAssignes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'mission'
});

export default mongoose.model('Mission', missionSchema);