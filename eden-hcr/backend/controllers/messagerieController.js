import Messagerie from '../models/Messagerie.js';

// @desc    Envoyer un message depuis le formulaire de contact
// @route   POST /api/messagerie
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation rapide
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Veuillez remplir tous les champs obligatoires.' 
      });
    }

    // Création dans Atlas
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