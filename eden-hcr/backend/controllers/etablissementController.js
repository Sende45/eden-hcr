import Etablissement from '../models/Etablissement.js';

export const registerEtablissement = async (req, res) => {
  try {
    const { siret } = req.body;

    const etablissementExiste = await Etablissement.findOne({ siret });
    if (etablissementExiste) {
      return res.status(400).json({
        status: 'error',
        message: 'Un établissement avec ce numéro SIRET est déjà inscrit.'
      });
    }

    const nouvelEtablissement = await Etablissement.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Demande d’inscription de l’établissement enregistrée.',
      data: nouvelEtablissement
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Erreur lors de la création du compte entreprise.",
      error: error.message
    });
  }
};