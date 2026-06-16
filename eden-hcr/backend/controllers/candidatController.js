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

// @desc    Modifier le statut d'un candidat
// @route   PATCH /api/candidat/:id/status
// @access  Admin
export const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidat = await Candidat.findById(id);

    if (!candidat) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidat introuvable'
      });
    }

    candidat.status = status;
    await candidat.save();

    res.status(200).json({
      status: 'success',
      message: 'Statut mis à jour avec succès',
      data: candidat
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};