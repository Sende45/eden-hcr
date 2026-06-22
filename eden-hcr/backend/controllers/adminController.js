import Candidat from '../models/Candidat.js';
import Etablissement from '../models/Etablissement.js';
import Mission from '../models/Mission.js';
import Paiements from '../models/Paiements.js';
import Planning from '../models/Planning.js';
import Contrat from '../models/Contrat.js';
import Rapport from '../models/Rapport.js';
import Messagerie from '../models/Messagerie.js';
import Channel from '../models/Channel.js';
import mongoose from 'mongoose';

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
    const tauxRemplissage = totalMissions > 0
      ? parseFloat(((missionsPourvues / totalMissions) * 100).toFixed(1))
      : 0;
    const etablissementsAValider = await Etablissement.find({
      statutCompte: 'en_attente_validation'
    }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        stats: { totalExtras, totalEntreprises, chiffreAffaires, totalMissions, tauxRemplissage, nouveauxExtrasCeMois },
        actionsRequises: { etablissementsAValider }
      }
    });
  } catch (error) { next(error); }
};

// @desc    Gestion des Missions
// @route   GET /api/admin/missions
export const getMissions = async (req, res, next) => {
  try {
    const missions = await Mission.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: missions });
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

// @desc    Gestion Messagerie (formulaire de contact)
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Messagerie.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: messages });
  } catch (error) { next(error); }
};

// @desc    Récupérer tous les channels de l'admin connecté
// @route   GET /api/admin/messages/channels
export const getChannels = async (req, res, next) => {
  try {
    const existing = await Channel.find({
      participants: req.user._id,
      isActive: true
    }).populate('participants', 'nom prenom email role');

    res.status(200).json({ status: 'success', data: existing });
  } catch (error) { next(error); }
};

// @desc    Récupérer ou créer un channel avec un extra
// @route   GET /api/admin/messages/channels/:channelId
export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    // Vérifie si c'est un ObjectId valide
    const isValidObjectId = mongoose.Types.ObjectId.isValid(channelId);

    let channel = null;

    if (isValidObjectId) {
      // Cherche d'abord un channel existant par son propre _id
      channel = await Channel.findOne({
        _id: channelId,
        participants: req.user._id
      }).populate('participants', 'nom prenom email role');

      // Sinon cherche un channel entre l'admin et cet userId
      if (!channel) {
        channel = await Channel.findOne({
          participants: { $all: [req.user._id, channelId] }
        }).populate('participants', 'nom prenom email role');
      }
    }

    // Toujours pas trouvé → on crée le channel
    if (!channel) {
      if (!isValidObjectId) {
        return res.status(400).json({ status: 'error', message: 'ID invalide.' });
      }
      channel = await Channel.create({
        participants: [req.user._id, channelId],
        messages: [],
        lastMessage: '',
        lastMessageAt: new Date()
      });
      channel = await channel.populate('participants', 'nom prenom email role');
    }

    res.status(200).json({ status: 'success', data: channel });
  } catch (error) { next(error); }
};

// @desc    Envoyer un message dans un channel
// @route   POST /api/admin/messages/channels/:channelId
export const sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message vide.' });
    }

    // Cherche le channel soit par son _id soit par les participants
    let channel = await Channel.findOne({
      _id: mongoose.Types.ObjectId.isValid(channelId) ? channelId : null,
      participants: req.user._id
    });

    if (!channel) {
      channel = await Channel.findOne({
        participants: { $all: [req.user._id, channelId] }
      });
    }

    if (!channel) {
      return res.status(404).json({ status: 'error', message: 'Channel introuvable.' });
    }

    channel.messages.push({
      expediteurId: req.user._id,
      contenu: text.trim()
    });
    channel.lastMessage = text.trim();
    channel.lastMessageAt = new Date();

    await channel.save();

    const updated = await Channel.findById(channel._id)
      .populate('participants', 'nom prenom email role');

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) { next(error); }
};

// @desc    Activer/Désactiver un candidat
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

    if (status === 'validated') {
      candidat.status = 'validated';
      candidat.statutValidation = 'approuve';
      candidat.actif = true;
    } else if (status === 'pending') {
      candidat.status = 'inactive';
      candidat.statutValidation = 'en_attente';
      candidat.actif = false;
    } else if (status === 'premium') {
      candidat.status = 'active';
      candidat.statutValidation = 'approuve';
      candidat.actif = true;
    } else {
      candidat.status = status;
    }

    await candidat.save();

    res.status(200).json({
      status: 'success',
      message: 'Statut mis à jour',
      data: candidat
    });
  } catch (error) { next(error); }
};