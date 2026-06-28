import Candidat from '../models/Candidat.js';

// @desc    Liste des candidats disponibles (vue client)
// @route   GET /api/clients/candidats
// @access  Privé — role: client
export const getCandidatsPourClients = async (req, res) => {
  try {
    // Récupérer tous les candidats avec les champs sélectionnés
    const candidats = await Candidat.find({})
      .select(
        'nom prenom email telephone poste ville competences disponibilites ' +
        'statut experience photoProfil nationalite langues noteAgence createdAt'
      )
      .sort({ createdAt: -1 });

    // ✅ Vérifier si des candidats existent
    if (!candidats || candidats.length === 0) {
      return res.status(200).json({
        status: 'success',
        total: 0,
        data: [],
        message: 'Aucun candidat trouvé'
      });
    }

    // ✅ Formater les données pour le client
    const formattedCandidats = candidats.map(candidat => ({
      _id: candidat._id,
      nom: candidat.nom || '',
      prenom: candidat.prenom || '',
      email: candidat.email || '',
      telephone: candidat.telephone || '',
      poste: candidat.poste || '',
      ville: candidat.ville || '',
      competences: candidat.competences || [],
      disponibilites: candidat.disponibilites || [],
      statut: candidat.statut || 'disponible',
      experience: candidat.experience || '',
      photoProfil: candidat.photoProfil || '',
      nationalite: candidat.nationalite || '',
      langues: candidat.langues || [],
      noteAgence: candidat.noteAgence || 0,
      createdAt: candidat.createdAt
    }));

    res.status(200).json({
      status: 'success',
      total: formattedCandidats.length,
      data: formattedCandidats
    });

  } catch (error) {
    console.error('===== GET CANDIDATS CLIENT ERROR =====');
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
    
    // ✅ Gestion des erreurs spécifiques
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Format de données invalide'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des candidats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};