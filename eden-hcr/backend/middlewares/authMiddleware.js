import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Non autorise, jeton invalide.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Acces refuse, aucun jeton trouve.'
    });
  }
};