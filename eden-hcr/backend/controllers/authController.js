import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Génération JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET manquant dans les variables d'environnement");
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    console.log('===== REGISTER REQUEST =====');
    console.log(req.body);

    const {
      email,
      password,
      nom,
      prenom,
      role,
      societe,
      candidatRef,
      etablissementRef
    } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe sont obligatoires.');
    }

    // Empêcher l'auto-inscription en tant qu'admin/superadmin
    if (role === 'admin' || role === 'superadmin') {
      res.status(403);
      throw new Error("Ce role ne peut pas etre attribue lors de l'inscription.");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Cet utilisateur existe deja.');
    }

    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      societe: societe || '',
      role: role || 'extra',
      candidatRef,
      etablissementRef
    });

    console.log('Utilisateur cree :', user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        societe: user.societe
      }
    });

  } catch (error) {
    console.error('===== REGISTER ERROR =====');
    console.error(error);

    return res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
      status: 'error',
      name: error.name,
      message: error.message,
      validationErrors: error.errors || null
    });
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe obligatoires.');
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error('Utilisateur introuvable.');
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Mot de passe incorrect.');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        societe: user.societe,
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef
      }
    });

  } catch (error) {
    console.error('===== LOGIN ERROR =====');
    console.error(error);

    return res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Profil utilisateur connecté
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {

    if (!req.user) {
      res.status(404);
      throw new Error('Utilisateur non trouve.');
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        nom: req.user.nom,
        prenom: req.user.prenom,
        societe: req.user.societe,
        candidatRef: req.user.candidatRef,
        etablissementRef: req.user.etablissementRef
      }
    });

  } catch (error) {
    console.error('===== GET ME ERROR =====');
    console.error(error);

    return res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
      status: 'error',
      message: error.message
    });
  }
};