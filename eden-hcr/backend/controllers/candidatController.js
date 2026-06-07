import Candidat from '../models/Candidat.js';

// @desc    Soumettre une candidature (Tunnel Onboarding)
// @route   POST /api/candidat
// @access  Public
export const registerCandidat = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérification de doublon d'email
    const candidatExiste = await Candidat.findOne({ email });
    if (candidatExiste) {
      return res.status(400).json({
        status: 'error',
        message: 'Un candidat avec cette adresse email a déjà postulé.'
      });
    }

    // Création du profil
    const nouveauCandidat = await Candidat.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Votre profil candidat a été enregistré avec succès !',
      data: nouveauCandidat
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Erreur lors de l'enregistrement de la candidature.",
      error: error.message
    });
  }
};