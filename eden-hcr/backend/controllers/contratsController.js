import Contrats from '../models/Contrat.js';

export const createContrat = async (req, res) => {
  try {
    const nouveauContrat = await Contrats.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Contrat de mission généré avec succès.',
      data: nouveauContrat
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la génération du contrat.',
      error: error.message
    });
  }
};

export const getContratsByCandidat = async (req, res) => {
  try {
    const contrats = await Contrats.find({ candidatId: req.params.candidatId })
      .populate('etablissementId', 'raisonSociale')
      .populate('missionId', 'posteRecherche dateDebut');
    res.status(200).json({
      status: 'success',
      data: contrats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des contrats.',
      error: error.message
    });
  }
};