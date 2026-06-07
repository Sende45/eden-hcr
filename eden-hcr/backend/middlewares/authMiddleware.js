import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // On récupère le user (sans son mot de passe) et on l'injecte dans la requête
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Non autorisé, jeton d’authentification invalide.'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Accès refusé, aucun jeton d’authentification trouvé.'));
  }
};