import Candidat from '../models/Candidat.js';
import Etablissement from '../models/Etablissement.js';
import Mission from '../models/Mission.js';
import Paiements from '../models/Paiements.js';

// @desc    Obtenir les métriques globales du SuperAdmin
// @route   GET /api/admin/metrics
export const getSuperAdminMetrics = async (req, res, next) => {
  try {
    // Vérification des droits d'accès
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error("Accès refusé. Réservé à la direction EDÈN Group.");
    }

    // Calcul de la date de début du mois pour les nouvelles inscriptions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Exécution des comptages en parallèle pour optimiser les performances
    const [
      totalExtras, 
      totalEntreprises, 
      totalMissions,
      nouveauxExtrasCeMois,
      missionsPourvues
    ] = await Promise.all([
      Candidat.countDocuments(),
      Etablissement.countDocuments(),
      Mission.countDocuments(),
      Candidat.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Mission.countDocuments({ statutMission: 'pourvue' })
    ]);

    // Calcul du chiffre d'affaires cumulé (statut traité)
    const revenuAggrege = await Paiements.aggregate([
      { $match: { statutVersement: 'traite' } },
      { $group: { _id: null, total: { $sum: '$montantBrut' } } }
    ]);

    const chiffreAffaires = revenuAggrege.length > 0 ? revenuAggrege[0].total : 0;

    // Calcul du taux de remplissage global en pourcentage
    const tauxRemplissage = totalMissions > 0 
      ? parseFloat(((missionsPourvues / totalMissions) * 100).toFixed(1)) 
      : 0;

    // Récupération des 5 dernières inscriptions d'établissements en attente de validation
    const etablissementsAValider = await Etablissement.find({ statutCompte: 'en_attente_validation' })
      .sort({ createdAt: -1 })
      .limit(5);

    // Envoi de la réponse structurée
    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalExtras,
          totalEntreprises,
          chiffreAffaires,
          totalMissions,
          tauxRemplissage,
          nouveauxExtrasCeMois
        },
        actionsRequises: {
          etablissementsAValider
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir la liste complète des candidats
// @route   GET /api/admin/candidates
export const getCandidates = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error("Accès refusé.");
    }

    const candidates = await Candidat.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: candidates });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir la liste complète des établissements
// @route   GET /api/admin/establishments
export const getEstablishments = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error("Accès refusé.");
    }

    const establishments = await Etablissement.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: establishments });
  } catch (error) {
    next(error);
  }
};