import Paiements from '../models/Paiements.js'; // ✅ déjà présent

export const processPaiementRecord = async (req, res) => {
  try {
    const nouveauPaiement = await Paiements.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Enregistrement de la transaction comptabilisé.',
      data: nouveauPaiement
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors du traitement financier.',
      error: error.message
    });
  }
};

export const getPaiementsByCandidat = async (req, res) => {
  try {
    const paiements = await Paiements.find({ candidatId: req.params.id })
      .sort({ dateEmission: -1 });
    res.json({ status: 'success', data: paiements });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};