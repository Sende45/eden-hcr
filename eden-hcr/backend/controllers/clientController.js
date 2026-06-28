import Candidat from '../models/Candidat.js';

// @desc    Liste des candidats disponibles (vue client)
// @route   GET /api/clients/candidats
// @access  Privé — role: client
export const getCandidatsPourClients = async (req, res) => {
  try {
    const candidats = await Candidat.find({})
      .select(
        'nom prenom email telephone poste ville competences disponibilites ' +
        'statut experience photoProfil nationalite langues noteAgence createdAt'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      total: candidats.length,
      data: candidats
    });
  } catch (error) {
    console.error('===== GET CANDIDATS CLIENT ERROR =====');
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};