import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Génération JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET manquant dans les variables d’environnement');
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
      candidatRef,
      etablissementRef
    } = req.body;

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

    console.log('Utilisateur créé :', user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom
      }
    });

  } catch (error) {
    console.error('===== REGISTER ERROR =====');
    console.error(error);
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);

    return res.status(500).json({
      status: 'error',
      name: error.name,
      message: error.message,
      validationErrors: error.errors || null
    });
  }
};