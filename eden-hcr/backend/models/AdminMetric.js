import mongoose from 'mongoose';

const adminMetricSchema = new mongoose.Schema({
  stats: {
    totalExtras: { type: Number, default: 0 },
    totalEntreprises: { type: Number, default: 0 },
    chiffreAffaires: { type: Number, default: 0 },
    totalMissions: { type: Number, default: 0 }
  },
  actionsRequises: {
    etablissementsAValider: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etablissement' 
    }]
  },
  agence: { type: String, default: 'AGENCE PARIS' }
}, { 
  collection: 'adminmetrics',
  timestamps: true // Ajouté pour gérer createdAt/updatedAt automatiquement
});

const AdminMetric = mongoose.model('AdminMetric', adminMetricSchema);

export default AdminMetric;