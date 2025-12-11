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
      console.log('❌ Auth Middleware: No token provided');
      return res.status(401).json({
        error: 'Accès refusé',
        message: 'Token requis'
      });
    }

    // console.log('🔍 Verifying token...', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('✅ Token decoded:', { userId: decoded.userId, lastActivity: decoded.lastActivity });

    // Vérifier l'inactivité (10 minutes = 600000 ms)
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
    if (decoded.lastActivity) {
      const timeSinceLastActivity = Date.now() - decoded.lastActivity;
      // console.log(`⏱️ Time since last activity: ${timeSinceLastActivity / 1000}s`);

      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.log('❌ Auth Middleware: Session timeout');
        return res.status(401).json({
          error: 'Session expirée',
          message: 'Votre session a expiré en raison d\'inactivité',
          code: 'SESSION_TIMEOUT'
        });
      }
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ Auth Middleware: User not found in DB', decoded.userId);
      return res.status(401).json({
        error: 'Accès refusé',
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Auth Middleware: Invalid Token', error.message);
      return res.status(401).json({
        error: 'Accès refusé',
        message: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      console.log('❌ Auth Middleware: Token Expired', error.expiredAt);
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
