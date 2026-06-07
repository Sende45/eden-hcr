import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Fonction interne pour générer le Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Valide pendant 30 jours
  });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, role, candidatRef, etablissementRef } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Cet utilisateur existe déjà.');
    }

    const user = await User.create({
      email,
      password,
      role,
      candidatRef,
      etablissementRef
    });

    res.status(201).json({
      status: 'success',
      token: generateToken(user._id),
      data: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
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
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef
      }
    });
  } catch (error) {
    next(error);
  }
};