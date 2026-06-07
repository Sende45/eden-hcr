import Paiements from '../models/Paiements.js';

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