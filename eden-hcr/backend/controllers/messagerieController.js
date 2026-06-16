import Messagerie from '../models/Messagerie.js';

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

    const nouveauMessage = await Messagerie.create({
      name,
      email,
      subject,
      message
    });

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