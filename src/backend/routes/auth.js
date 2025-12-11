import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Sequelize, Op } from 'sequelize';
import { User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { notifyNewSystemUser } from '../utils/notificationHelper.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
} from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    // Forcer le rôle 'user' pour l'inscription publique
    const role = 'user';

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Champs requis',
        message: 'Prénom, nom, email et mot de passe sont requis'
      });
    }

    // Combiner firstName et lastName pour le nom complet
    const name = `${firstName} ${lastName}`;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email existe déjà',
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Créer le token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retourner les infos utilisateur (sans mot de passe)
    const userResponse = {
      id: user.id,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Créer le token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retourner les infos utilisateur (sans mot de passe)
    const [firstName, lastName] = user.name ? user.name.split(' ') : ['', ''];
    const userResponse = {
      id: user.id,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    res.json({
      message: 'Connexion réussie',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la connexion'
    });
  }
});

/**
 * GET /api/auth/profile
 * Obtenir le profil de l'utilisateur connecté
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Profil récupéré avec succès',
      user: req.user
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil de l'utilisateur
 */
router.put('/profile', validateProfileUpdate, authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== req.user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Sequelize.Op.ne]: userId } }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Email existe déjà',
          message: 'Cet email est déjà utilisé par un autre compte'
        });
      }
    }

    // Mettre à jour l'utilisateur
    await User.update(
      { name, email, phone },
      { where: { id: userId } }
    );

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Changer le mot de passe
 */
router.post('/change-password', validatePasswordChange, authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Récupérer l'utilisateur avec mot de passe
    const user = await User.findByPk(userId);

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe actuel est incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.json({
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors du changement de mot de passe'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Rafraîchir le token avec une nouvelle activité
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    // Créer un nouveau token avec lastActivity mis à jour
    const newToken = jwt.sign(
      {
        userId,
        email,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Token rafraîchi avec succès',
      token: newToken
    });

  } catch (error) {
    console.error('Erreur rafraîchissement token:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors du rafraîchissement du token'
    });
  }
});

/**
 * GET /api/auth/users
 * Lister les utilisateurs admin et gestionnaires
 * Réservé aux administrateurs
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 GET /users request received');
    const { search } = req.query;

    // Test Op availability
    console.log('Using Op.in:', Op.in);

    const whereClause = {
      role: { [Op.in]: ['admin', 'gestionnaire'] }
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('📝 Executing User.findAll...');
    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    console.log(`✅ Users found: ${users.length}`);

    res.json(users);
  } catch (error) {
    console.error('❌ Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

/**
 * POST /api/auth/create-user
 * Créer un nouvel administrateur ou gestionnaire
 * Réservé aux administrateurs
 */
router.post('/create-user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        error: 'Champs requis',
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Valider le rôle
    if (!['admin', 'gestionnaire'].includes(role)) {
      return res.status(400).json({
        error: 'Rôle invalide',
        message: 'Le rôle doit être admin ou gestionnaire'
      });
    }

    // Vérifier email unique
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email existe déjà',
        message: 'Cet email est déjà utilisé'
      });
    }

    const name = `${firstName} ${lastName}`;
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at
    };

    // Notifier les admins de la création d'un nouvel utilisateur système
    await notifyNewSystemUser(newUser);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
});

/**
 * GET /api/auth/users/:id
 * Récupérer un utilisateur par ID
 */
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/auth/users/:id
 * Modifier un utilisateur
 */
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role, phone, password } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier email unique si changé
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
    }

    const updates = {};
    if (firstName && lastName) updates.name = `${firstName} ${lastName}`;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (phone !== undefined) updates.phone = phone;

    // Mot de passe seulement si fourni
    if (password && password.trim() !== '') {
      const saltRounds = 12;
      updates.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updates);

    res.json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se supprimer soi-même
    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
