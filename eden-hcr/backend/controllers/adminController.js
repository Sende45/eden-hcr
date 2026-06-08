import Candidat from '../models/Candidat.js';
import Etablissement from '../models/Etablissement.js';
import Mission from '../models/Mission.js';
import Paiements from '../models/Paiements.js';

// @desc    Obtenir les métriques globales du SuperAdmin
// @route   GET /api/admin/metrics
export const getSuperAdminMetrics = async (req, res, next) => {
  try {
    // Sécurité supplémentaire : Vérification du rôle de l'utilisateur injecté par le middleware protect
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error("Accès refusé. Réservé à la direction EDÈN Group.");
    }

    // Exécution des comptages en parallèle sur Atlas
    const [totalExtras, totalEntreprises, totalMissions] = await Promise.all([
      Candidat.countDocuments(),
      Etablissement.countDocuments(),
      Mission.countDocuments()
    ]);

    // Calcul du volume financier global (Chiffre d'affaires brut cumulé)
    const revenuAggrege = await Paiements.aggregate([
      { $match: { statutVersement: 'traite' } },
      { $group: { _id: null, total: { $sum: '$montantBrut' } } }
    ]);

    const chiffreAffaires = revenuAggrege.length > 0 ? revenuAggrege[0].total : 0;

    // Récupération des 5 dernières inscriptions d'établissements en attente de validation
    const etablissementsAValider = await Etablissement.find({ statutCompte: 'en_attente_validation' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalExtras,
          totalEntreprises,
          chiffreAffaires,
          totalMissions
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