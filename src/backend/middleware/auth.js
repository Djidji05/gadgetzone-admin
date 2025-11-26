import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Accès refusé',
        message: 'Token requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Accès refusé',
        message: 'Utilisateur non trouvé' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Accès refusé',
        message: 'Token invalide' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Accès refusé',
        message: 'Token expiré' 
      });
    }

    console.error('Erreur auth middleware:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Erreur lors de l\'authentification' 
    });
  }
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Droits administratifs requis' 
    });
  }
  next();
};

/**
 * Middleware optionnel (n'échoue pas si pas de token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignorer les erreurs pour l'auth optionnelle
    next();
  }
};
