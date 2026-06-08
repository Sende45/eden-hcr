import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Fonction interne pour générer le Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, nom, prenom, role, candidatRef, etablissementRef } = req.body;

    // Vérification basique pour éviter les erreurs serveur 500
    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe sont obligatoires.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Cet utilisateur existe déjà.');
    }

    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      role: role || 'extra',
      candidatRef,
      etablissementRef
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        token: generateToken(user._id),
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom
        }
      });
    } else {
      res.status(400);
      throw new Error('Données utilisateur invalides.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion de l'utilisateur
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Identifiants invalides (Email ou mot de passe incorrect).');
    }

    res.status(200).json({
      status: 'success',
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    // Le middleware 'protect' a déjà ajouté l'utilisateur à req.user
    if (!req.user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé.");
    }

    res.status(200).json({
      status: 'success',
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      nom: req.user.nom,
      prenom: req.user.prenom,
      candidatRef: req.user.candidatRef,
      etablissementRef: req.user.etablissementRef
    });
  } catch (error) {
    next(error);
  }
};