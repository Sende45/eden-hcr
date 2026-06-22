import Messagerie from '../models/Messagerie.js';
import Channel from '../models/Channel.js';

// @desc    Envoyer un message depuis le formulaire de contact
// @route   POST /api/messagerie
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez remplir tous les champs obligatoires.'
      });
    }

    const nouveauMessage = await Messagerie.create({ name, email, subject, message });

    res.status(201).json({
      status: 'success',
      message: 'Votre message a bien été envoyé !',
      data: nouveauMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Une erreur est survenue lors de l'envoi du message.",
      error: error.message
    });
  }
};

// @desc    Récupérer les notifications
// @route   GET /api/messagerie/notifications
// @access  Private/Admin
export const getNotifications = async (req, res) => {
  try {
    const messages = await Messagerie.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      count: messages.length,
      notifications: messages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des notifications.',
      error: error.message
    });
  }
};

// @desc    Récupérer tous les channels de l'admin
// @route   GET /api/admin/messages/channels
// @access  Private/Admin
export const getAdminChannels = async (req, res) => {
  try {
    const channels = await Channel.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'nom prenom email role')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ status: 'success', data: channels });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Récupérer ou créer un channel entre admin et un extra (par userId du candidat)
// @route   GET /api/admin/messages/channels/:userId
// @access  Private/Admin
export const getOrCreateChannel = async (req, res) => {
  try {
    const { userId } = req.params;

    let channel = await Channel.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'nom prenom email role');

    if (!channel) {
      channel = await Channel.create({
        participants: [req.user._id, userId],
        messages: [],
        lastMessage: '',
        lastMessageAt: new Date()
      });
      channel = await channel.populate('participants', 'nom prenom email role');
    }

    res.status(200).json({ status: 'success', data: channel });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Envoyer un message dans un channel existant
// @route   POST /api/admin/messages/channels/:channelId
// @access  Private
export const sendChannelMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message vide.' });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ status: 'error', message: 'Channel introuvable.' });
    }

    const participantIds = channel.participants.map(p => p.toString());
    if (!participantIds.includes(req.user._id.toString())) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé.' });
    }

    channel.messages.push({
      expediteurId: req.user._id,
      contenu: text.trim()
    });
    channel.lastMessage = text.trim();
    channel.lastMessageAt = new Date();
    channel.unread = channel.unread + 1;

    await channel.save();

    const updated = await Channel.findById(channelId)
      .populate('participants', 'nom prenom email role');

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};