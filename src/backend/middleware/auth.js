import jwt from 'jsonwebtoken';
import { Sequelize, Op } from 'sequelize';
import { User, Role } from '../models/index.js';
import sequelize from '../config/database.js';

// Cache pour les utilisateurs (évite de taper la DB à chaque requête)
const userCache = new Map();
const USER_CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

    if (!token) {
      console.log('❌ Auth Middleware: No token provided');
      return res.status(401).json({ error: 'Accès refusé', message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Vérifier l'inactivité (60 minutes)
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
    if (decoded.lastActivity && (Date.now() - decoded.lastActivity > INACTIVITY_TIMEOUT)) {
      console.log('❌ Auth Middleware: Session timeout');
      return res.status(401).json({ error: 'Session expirée', message: 'Inactivité prolongée', code: 'SESSION_TIMEOUT' });
    }

    // Vérifier le cache
    const cached = userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp < USER_CACHE_TTL)) {
      req.user = cached.user;
      return next();
    }

    // Sinon, charger depuis la DB
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ Auth Middleware: User not found', userId);
      return res.status(401).json({ error: 'Accès refusé', message: 'Utilisateur non trouvé' });
    }

    let permissions = cached?.permissions || [];

    if (!cached || !cached.permissions) {
      try {
        const roleName = user.role || 'customer'; // Re-get for clarity
        const roleData = await Role.findOne({
          where: { name: roleName }
        });
        if (roleData) {
          permissions = roleData.permissions || [];
        }
      } catch (roleError) {
        console.error('Error fetching role permissions:', roleError);
      }
    }

    // Mettre en cache avec permissions
    userCache.set(userId, {
      user,
      permissions,
      timestamp: Date.now()
    });

    user.permissions = permissions;

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
 * Middleware pour vérifier si l'utilisateur a une permission spécifique
 */
export const hasPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Admins have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Permission manquante : ${permission}`
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'gestionnaire')) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Accès réservé aux administrateurs et gestionnaires.'
    });
  }
  next();
};

/**
 * Middleware pour vérifier le rôle vendeur
 */
export const isSeller = (req, res, next) => {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Compte vendeur requis'
    });
  }
  next();
};

/**
 * Middleware pour vérifier si la boutique du vendeur est active (non suspendue)
 * Doit être placé APRÈS authenticateToken
 */
export const checkStoreActive = async (req, res, next) => {
  try {
    // Lazy load Store model to avoid circular dependency if any
    const { Store } = await import('../models/index.js');

    const store = await Store.findOne({ where: { userId: req.user.id } });

    // Les admins peuvent tout faire, mais on attache quand même le store s'il existe
    if (req.user.role === 'admin') {
      if (store) req.store = store;
      return next();
    }

    // Si pas de boutique, pas le droit de créer des produits (sauf si admin, déjà géré)
    if (!store) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous devez avoir une boutique pour effectuer cette action.'
      });
    }

    if (store.status === 'suspended') {
      return res.status(403).json({
        error: 'Boutique suspendue',
        message: 'Votre boutique est suspendue. Vous ne pouvez pas ajouter ou modifier des produits ou des ventes. Veuillez contacter le support.',
        code: 'STORE_SUSPENDED'
      });
    }

    if (store.status !== 'active') {
      return res.status(403).json({
        error: 'Boutique non active',
        message: `Votre boutique est en statut : ${store.status}. Attendez l'approbation.`,
        code: 'STORE_NOT_ACTIVE'
      });
    }

    req.store = store; // Attach store to request for convenience
    next();
  } catch (error) {
    console.error('Error in checkStoreActive:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la vérification du statut boutique' });
  }
};

/**
 * Middleware optionnel (n'échoue pas si pas de token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    // Check Authorization Header OR Cookie
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

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
