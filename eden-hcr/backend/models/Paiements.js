import mongoose from 'mongoose';

const paiementsSchema = new mongoose.Schema({
  contratId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrats',
    required: true
  },
  candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true
  },
  montantBrut: {
    type: Number,
    required: true
  },
  montantNetA_Payer: {
    type: Number,
    required: true
  },
  statutVersement: {
    type: String,
    enum: ['en_attente', 'traite', 'echoue'],
    default: 'en_attente'
  },
  dateVersementEffectif: {
    type: Date
  },
  transactionReference: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'paiements'
});

export default mongoose.model('Paiements', paiementsSchema);