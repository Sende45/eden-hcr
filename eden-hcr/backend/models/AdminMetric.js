const mongoose = require('mongoose');

const adminMetricSchema = new mongoose.Schema({
  // Utilise '_id' pour correspondre à MongoDB
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
}, { collection: 'adminmetrics' }); // Force le nom de la collection ici

module.exports = mongoose.model('AdminMetric', adminMetricSchema);