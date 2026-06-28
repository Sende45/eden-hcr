import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ── Génération JWT ────────────────────────────────────────────────────────────
const generateToken = (id) => {
  console.log('🔑 [generateToken] JWT_SECRET existe:', !!process.env.JWT_SECRET);
  console.log('🔑 [generateToken] JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET manquant dans les variables d\'environnement');
    throw new Error('JWT_SECRET manquant dans les variables d\'environnement');
  }

  try {
    const token = jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    console.log('✅ Token généré avec succès');
    return token;
  } catch (error) {
    console.error('❌ Erreur génération token:', error.message);
    throw error;
  }
};

// ── Vérification des champs obligatoires ─────────────────────────────────────
const validateRequiredFields = (fields, required) => {
  const missing = required.filter(field => !fields[field]);
  if (missing.length > 0) {
    throw new Error(`Champs obligatoires manquants: ${missing.join(', ')}`);
  }
};

// ── Inscription ────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    console.log('===== 📝 REGISTER REQUEST =====');
    console.log('📝 Corps de la requête:', req.body);

    const {
      email,
      password,
      nom,
      prenom,
      role,
      societe,
      telephone,
      candidatRef,
      etablissementRef
    } = req.body;

    // ✅ Validation des champs obligatoires
    try {
      validateRequiredFields({ email, password }, ['email', 'password']);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    // ✅ Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format d\'email invalide'
      });
    }

    // ✅ Empêcher l'auto-inscription en tant qu'admin/superadmin
    if (role === 'admin' || role === 'superadmin') {
      return res.status(403).json({
        status: 'error',
        message: 'Ce rôle ne peut pas être attribué lors de l\'inscription.'
      });
    }

    // ✅ Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet utilisateur existe déjà.'
      });
    }

    // ✅ Créer l'utilisateur
    const userData = {
      email,
      password,
      role: role || 'extra',
      nom: nom || '',
      prenom: prenom || '',
      societe: societe || '',
      telephone: telephone || '',
      candidatRef: candidatRef || null,
      etablissementRef: etablissementRef || null,
      statutCompte: 'actif'
    };

    // ✅ Validation des champs requis selon le rôle
    if (userData.role === 'client' || userData.role === 'extra') {
      if (!userData.nom || !userData.prenom) {
        return res.status(400).json({
          status: 'error',
          message: `Le nom et le prénom sont obligatoires pour le rôle "${userData.role}"`
        });
      }
    }

    if ((userData.role === 'client' || userData.role === 'etablissement') && !userData.societe) {
      return res.status(400).json({
        status: 'error',
        message: `Le nom de la société est obligatoire pour le rôle "${userData.role}"`
      });
    }

    const user = await User.create(userData);

    console.log('✅ Utilisateur créé :', user._id);

    // ✅ Générer le token
    const token = generateToken(user._id);

    // ✅ Mettre à jour la date de dernière connexion
    await User.updateOne(
  { _id: user._id },
  {
    $set: {
      derniereConnexion: new Date()
    }
  }
);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        societe: user.societe,
        telephone: user.telephone,
        photoProfil: user.photoProfil,
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef,
        statutCompte: user.statutCompte
      }
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);

    // ✅ Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: 'Erreur de validation',
        errors
      });
    }

    // ✅ Gestion des erreurs de duplication
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet email est déjà utilisé.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Erreur interne du serveur'
    });
  }
};

// ── Connexion ──────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  console.log('===== 🔐 LOGIN REQUEST =====');
  console.log('📧 Email reçu:', req.body?.email);
  console.log('🔑 JWT_SECRET existe:', !!process.env.JWT_SECRET);
  console.log('📦 MONGO_URI existe:', !!process.env.MONGO_URI);

  try {
    const { email, password } = req.body;

    // ✅ Validation des champs
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({
        status: 'error',
        message: 'Email et mot de passe obligatoires.'
      });
    }

    // ✅ Vérifier la connexion MongoDB
    console.log('🔍 Recherche de l\'utilisateur...');

    // ⚠️ IMPORTANT: On doit inclure le password avec .select('+password')
    const user = await User.findOne({ email }).select('+password');

    console.log('👤 Utilisateur trouvé:', !!user);
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // ✅ Vérifier le statut du compte
    if (user.statutCompte === 'suspendu') {
      return res.status(403).json({
        status: 'error',
        message: 'Votre compte a été suspendu. Contactez l\'administrateur.'
      });
    }

    if (user.statutCompte === 'en_attente') {
      return res.status(403).json({
        status: 'error',
        message: 'Votre compte est en attente de validation.'
      });
    }

    // ✅ Vérifier le mot de passe
    console.log('🔑 Vérification du mot de passe...');
    const isMatch = await user.matchPassword(password);
    console.log('✅ Mot de passe valide:', isMatch);

    if (!isMatch) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect.'
      });
    }

    console.log('✅ Connexion réussie pour:', email);

    // ✅ Générer le token
    console.log('🎫 Génération du token...');
    const token = generateToken(user._id);

    // ✅ Mettre à jour la date de dernière connexion
    user.derniereConnexion = new Date();
    await user.save();

    // ✅ Réponse avec les données utilisateur (sans le mot de passe)
    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom || '',
        prenom: user.prenom || '',
        societe: user.societe || '',
        telephone: user.telephone || '',
        photoProfil: user.photoProfil || '',
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef,
        statutCompte: user.statutCompte,
        derniereConnexion: user.derniereConnexion
      }
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR DETAILS:');
    console.error('📝 Message:', error.message);
    console.error('📝 Stack:', error.stack);
    console.error('📝 Name:', error.name);

    // ✅ Gestion des erreurs spécifiques
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur de génération du token JWT.'
      });
    }

    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        status: 'error',
        message: 'Impossible de se connecter à la base de données.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Erreur interne du serveur.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ── Profil utilisateur ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    console.log('===== 👤 GET ME REQUEST =====');
    console.log('👤 Utilisateur ID:', req.user?._id);

    if (!req.user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.'
      });
    }

    // ✅ Récupérer l'utilisateur à jour depuis la base
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.'
      });
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom || '',
        prenom: user.prenom || '',
        societe: user.societe || '',
        telephone: user.telephone || '',
        photoProfil: user.photoProfil || '',
        candidatRef: user.candidatRef,
        etablissementRef: user.etablissementRef,
        statutCompte: user.statutCompte,
        derniereConnexion: user.derniereConnexion,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ GET ME ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Erreur interne du serveur.'
    });
  }
};

// ── Déconnexion ─────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res) => {
  try {
    // Le token côté client doit être supprimé
    // Le serveur peut juste valider la déconnexion
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('❌ LOGOUT ERROR:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la déconnexion'
    });
  }
};