import mongoose from 'mongoose';

const planningSchema = new mongoose.Schema({
  candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: [true, "Le candidat est obligatoire."]
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, "La mission associée est obligatoire."]
  },
  dateShift: {
    type: Date,
    required: true
  },
  heureDebutEffective: {
    type: String, // Format "HH:MM"
    required: true
  },
  heureFinEffective: {
    type: String, // Format "HH:MM"
    required: true
  },
  statutEmargement: {
    type: String,
    enum: ['planifie', 'valide_extra', 'approuve_etablissement', 'litige'],
    default: 'planifie'
  },
  heuresTotalesRealisees: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'planning'
});

export default mongoose.model('Planning', planningSchema);