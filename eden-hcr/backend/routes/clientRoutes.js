import express from 'express';
import { getCandidatsPourClients } from '../controllers/clientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware local : vérifie que l'utilisateur est bien un client (ou admin)
const clientOnly = (req, res, next) => {
  const allowed = ['client', 'admin', 'superadmin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Accès réservé aux clients EDÈN.'
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════════════
// ✅ ROUTES EXISTANTES
// ═══════════════════════════════════════════════════════════════════════

// GET /api/clients/candidats - Liste des candidats disponibles
router.get('/candidats', protect, clientOnly, getCandidatsPourClients);

// ═══════════════════════════════════════════════════════════════════════
// ✅ NOUVELLES ROUTES AJOUTÉES
// ═══════════════════════════════════════════════════════════════════════

// GET /api/clients/candidats/:id - Détails d'un candidat spécifique
router.get('/candidats/:id', protect, clientOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const Candidat = (await import('../models/Candidat.js')).default;
    
    const candidat = await Candidat.findById(id)
      .select(
        'nom prenom email telephone poste ville competences disponibilites ' +
        'statut experience photoProfil nationalite langues noteAgence createdAt ' +
        'civilite metier adresse cvUrl documents noteMoyenne nombreMissions'
      );
    
    if (!candidat) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidat non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: candidat
    });
  } catch (error) {
    console.error('Erreur getCandidatById:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/clients/candidats/search/avancee - Recherche avancée
router.get('/candidats/search/avancee', protect, clientOnly, async (req, res) => {
  try {
    const { 
      recherche, 
      poste, 
      ville, 
      statut, 
      noteMin, 
      disponibleImmediatement,
      page = 1,
      limit = 20
    } = req.query;
    
    const Candidat = (await import('../models/Candidat.js')).default;
    
    // Construire la requête
    const query = { actif: true };
    
    if (recherche && recherche.trim().length > 0) {
      query.$text = { $search: recherche };
    }
    
    if (poste) query.poste = { $regex: poste, $options: 'i' };
    if (ville) query.ville = { $regex: ville, $options: 'i' };
    if (statut) query.statut = statut;
    if (noteMin) query.noteAgence = { $gte: parseFloat(noteMin) };
    if (disponibleImmediatement === 'true') query.disponibleImmediatement = true;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [candidats, total] = await Promise.all([
      Candidat.find(query)
        .sort({ noteAgence: -1, nombreMissions: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          'nom prenom email telephone poste ville competences ' +
          'statut experience photoProfil langues noteAgence ' +
          'disponibleImmediatement scoreFiabilite'
        ),
      Candidat.countDocuments(query)
    ]);
    
    res.status(200).json({
      status: 'success',
      data: candidats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur recherche avancée:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/clients/stats - Statistiques pour le client
router.get('/stats', protect, clientOnly, async (req, res) => {
  try {
    const Candidat = (await import('../models/Candidat.js')).default;
    
    const [
      totalCandidats,
      disponibles,
      enMission,
      noteMoyenne,
      topCandidats
    ] = await Promise.all([
      Candidat.countDocuments({ actif: true }),
      Candidat.countDocuments({ actif: true, statut: 'disponible' }),
      Candidat.countDocuments({ actif: true, statut: 'en_mission' }),
      Candidat.aggregate([
        { $match: { actif: true, noteAgence: { $gt: 0 } } },
        { $group: { _id: null, moyenne: { $avg: '$noteAgence' } } }
      ]),
      Candidat.find({ actif: true, noteAgence: { $gt: 0 } })
        .sort({ noteAgence: -1 })
        .limit(5)
        .select('nom prenom poste noteAgence')
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCandidats,
        disponibles,
        enMission,
        noteMoyenne: noteMoyenne.length > 0 ? Math.round(noteMoyenne[0].moyenne * 10) / 10 : 0,
        topCandidats
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/clients/filtres - Récupérer les valeurs disponibles pour les filtres
router.get('/filtres', protect, clientOnly, async (req, res) => {
  try {
    const Candidat = (await import('../models/Candidat.js')).default;
    
    const [postes, villes, statuts] = await Promise.all([
      Candidat.distinct('poste', { actif: true, poste: { $ne: '' } }),
      Candidat.distinct('ville', { actif: true, ville: { $ne: '' } }),
      Candidat.distinct('statut', { actif: true })
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        postes: postes.filter(Boolean).sort(),
        villes: villes.filter(Boolean).sort(),
        statuts: statuts.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('Erreur filtres:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;