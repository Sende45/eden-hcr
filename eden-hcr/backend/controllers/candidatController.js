// candidatController.js
import Candidat from '../models/Candidat.js';

// @desc    Soumettre une candidature
// @route   POST /api/candidat
export const registerCandidat = async (req, res) => {
  try {
    const { email } = req.body;

    const candidatExiste = await Candidat.findOne({ email });
    if (candidatExiste) {
      return res.status(400).json({
        status: 'error',
        message: 'Un candidat avec cette adresse email a déjà postulé.'
      });
    }

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

// @desc    Upload des documents d'un candidat
// @route   POST /api/candidat/:id/documents
export const uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const candidat = await Candidat.findById(id);
    if (!candidat) {
      return res.status(404).json({ status: 'error', message: 'Candidat introuvable.' });
    }

    const files = req.files || {};
    const now   = new Date();
    const updates = {};

    if (files.idCard?.[0]) {
      updates['documents.idCardUrl']        = `/uploads/documents/${files.idCard[0].filename}`;
      updates['documents.idCardUploadedAt'] = now;
    }
    if (files.vitaleCard?.[0]) {
      updates['documents.vitaleCardUrl']        = `/uploads/documents/${files.vitaleCard[0].filename}`;
      updates['documents.vitaleCardUploadedAt'] = now;
    }
    if (files.rib?.[0]) {
      updates['documents.ribUrl']        = `/uploads/documents/${files.rib[0].filename}`;
      updates['documents.ribUploadedAt'] = now;
    }
    if (files.titreSejour?.[0]) {
      updates['documents.titreSejourUrl']        = `/uploads/documents/${files.titreSejour[0].filename}`;
      updates['documents.titreSejourUploadedAt'] = now;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ status: 'error', message: 'Aucun document reçu.' });
    }

    const updated = await Candidat.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: `${Object.keys(updates).length / 2} document(s) enregistré(s).`,
      data: { documents: updated.documents }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Erreur lors de l'upload des documents.",
      error: error.message
    });
  }
};

// @desc    Modifier le statut d'un candidat
// @route   PATCH /api/candidat/:id/status
export const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidat = await Candidat.findById(id);
    if (!candidat) {
      return res.status(404).json({ status: 'error', message: 'Candidat introuvable' });
    }

    candidat.status = status;
    await candidat.save();

    res.status(200).json({ status: 'success', message: 'Statut mis à jour avec succès', data: candidat });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};

// @desc    Rechercher des candidats
// @route   GET /api/candidat/search?q=...
export const searchCandidats = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.status(200).json([]);

    const candidats = await Candidat.find({
      $or: [
        { nom:    { $regex: q, $options: 'i' } },
        { prenom: { $regex: q, $options: 'i' } },
        { email:  { $regex: q, $options: 'i' } },
      ]
    }).limit(20).sort({ createdAt: -1 });

    res.status(200).json(candidats);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur lors de la recherche des candidats', error: error.message });
  }
};