import Candidat from '../models/Candidat.js';
import Etablissement from '../models/Etablissement.js';
import Mission from '../models/Mission.js';
import Paiements from '../models/Paiements.js';
import Planning from '../models/Planning.js';
import Contrat from '../models/Contrat.js';
import Rapport from '../models/Rapport.js';
import Messagerie from '../models/Messagerie.js';

// @desc    Obtenir les métriques globales du SuperAdmin
// @route   GET /api/admin/metrics
export const getSuperAdminMetrics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error("Accès refusé. Réservé à la direction EDÈN Group.");
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalExtras, totalEntreprises, totalMissions, nouveauxExtrasCeMois, missionsPourvues
    ] = await Promise.all([
      Candidat.countDocuments(),
      Etablissement.countDocuments(),
      Mission.countDocuments(),
      Candidat.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Mission.countDocuments({ statutMission: 'pourvue' })
    ]);

    const revenuAggrege = await Paiements.aggregate([
      { $match: { statutVersement: 'traite' } },
      { $group: { _id: null, total: { $sum: '$montantBrut' } } }
    ]);

    const chiffreAffaires = revenuAggrege.length > 0 ? revenuAggrege[0].total : 0;
    const tauxRemplissage = totalMissions > 0 ? parseFloat(((missionsPourvues / totalMissions) * 100).toFixed(1)) : 0;
    const etablissementsAValider = await Etablissement.find({ statutCompte: 'en_attente_validation' }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      status: 'success',
      data: { stats: { totalExtras, totalEntreprises, chiffreAffaires, totalMissions, tauxRemplissage, nouveauxExtrasCeMois }, actionsRequises: { etablissementsAValider } }
    });
  } catch (error) { next(error); }
};

// @desc    Gestion Candidats
export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidat.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: candidates });
  } catch (error) { next(error); }
};

// @desc    Gestion Établissements
export const getEstablishments = async (req, res, next) => {
  try {
    const establishments = await Etablissement.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: establishments });
  } catch (error) { next(error); }
};

// @desc    Gestion Planning
export const getPlanningData = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const shifts = await Planning.find({ date: { $gte: start, $lte: end } });
    res.status(200).json({ status: 'success', data: shifts });
  } catch (error) { next(error); }
};

// @desc    Gestion Contrats
export const getContrats = async (req, res, next) => {
  try {
    const contrats = await Contrat.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: contrats });
  } catch (error) { next(error); }
};

// @desc    Gestion Rapports
export const getReports = async (req, res, next) => {
  try {
    const reports = await Rapport.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: reports });
  } catch (error) { next(error); }
};

// @desc    Gestion Paiements
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Paiements.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: payments });
  } catch (error) { next(error); }
};

// @desc    Gestion Messagerie
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Messagerie.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: messages });
  } catch (error) { next(error); }
};

export const sendMessage = async (req, res, next) => {
  try {
    const newMessage = await Messagerie.create(req.body);
    res.status(201).json({ status: 'success', data: newMessage });
  } catch (error) { next(error); }
};

// @desc    Activer/Désactiver un candidat
// @route   PATCH /api/admin/candidates/:id/status
export const updateCandidateStatus = async (req, res, next) => {
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
      message: 'Statut mis à jour',
      data: candidat
    });
  } catch (error) {
    next(error);
  }
};