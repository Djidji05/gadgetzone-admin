import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Sequelize, Op } from 'sequelize';
import { User, Order } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { notifyNewSystemUser } from '../utils/notificationHelper.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
} from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    // Forcer le rôle 'customer' pour l'inscription publique
    const role = 'customer';

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Champs requis',
        message: 'Prénom, nom, email et mot de passe sont requis'
      });
    }

    // === Lire la politique de mot de passe depuis les paramètres de sécurité ===
    try {
      const Setting = (await import('../models/Setting.js')).default;
      const securitySettings = await Setting.findAll({ where: { category: 'security' } });
      const sec = {};
      securitySettings.forEach(s => { sec[s.key] = s.value; });

      const minLength = parseInt(sec.min_password_length || '8');
      const requireUppercase = (sec.require_uppercase || 'true') === 'true';
      const requireNumbers = (sec.require_numbers || 'true') === 'true';
      const requireSpecialChars = (sec.require_special_chars || 'false') === 'true';

      const policyErrors = [];
      if (password.length < minLength) {
        policyErrors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
      }
      if (requireUppercase && !/[A-Z]/.test(password)) {
        policyErrors.push('Le mot de passe doit contenir au moins une lettre majuscule');
      }
      if (requireNumbers && !/[0-9]/.test(password)) {
        policyErrors.push('Le mot de passe doit contenir au moins un chiffre');
      }
      if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        policyErrors.push('Le mot de passe doit contenir au moins un caractère spécial');
      }

      if (policyErrors.length > 0) {
        return res.status(400).json({
          error: 'Mot de passe invalide',
          message: policyErrors[0],
          errors: policyErrors
        });
      }
    } catch (policyErr) {
      console.warn('[Auth] Could not load password policy, using defaults:', policyErr.message);
    }
    // === Fin validation politique ===

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
        role: user.role,
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
      is_ambassador: user.is_ambassador,
      referral_code: user.referral_code,
      created_at: user.created_at
    };

    // Set HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      domain: process.env.COOKIE_DOMAIN
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: userResponse
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

    // Les customers, sellers, admins et gestionnaires peuvent se connecter
    if (!['admin', 'gestionnaire', 'seller', 'customer'].includes(user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Ce compte n\'est pas autorisé à se connecter.'
      });
    }

    // Créer le token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retourner les infos utilisateur (sans mot de passe)
    const [firstName, lastName] = user.name ? user.name.split(' ') : ['', ''];

    // Check if user has a store
    const { Store } = await import('../models/index.js');
    const store = await Store.findOne({ where: { userId: user.id } });

    const userResponse = {
      id: user.id,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      is_ambassador: user.is_ambassador,
      referral_code: user.referral_code,
      created_at: user.created_at,
      storeStatus: store ? store.status : null,
      storeId: store ? store.id : null
    };

    // Set HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      domain: process.env.COOKIE_DOMAIN
    });

    res.json({
      message: 'Connexion réussie',
      token,
      user: userResponse
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
 * POST /api/auth/logout
 * Déconnexion de l'utilisateur
 */
router.post('/logout', async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN
  });
  res.json({ message: 'Déconnexion réussie' });
});

/**
 * GET /api/auth/profile
 * Obtenir le profil de l'utilisateur connecté
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user.toJSON ? req.user.toJSON() : req.user;
    const [firstName, ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
    const lastName = lastNameParts.join(' ');

    res.json({
      message: 'Profil récupéré avec succès',
      user: { ...user, firstName, lastName }
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
    const { name, email, phone, currentPassword, password } = req.body;
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

    const updates = { name, email, phone };

    // Check if user wants to update password
    if (password) {
      const user = await User.findByPk(userId);
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid password',
          message: 'Le mot de passe actuel est incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      updates.password = await bcrypt.hash(password, saltRounds);
    }

    // Mettre à jour l'utilisateur
    await User.update(
      updates,
      { where: { id: userId } }
    );

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    const userObj = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;
    const [firstName, ...lastNameParts] = userObj.name ? userObj.name.split(' ') : ['', ''];
    const lastName = lastNameParts.join(' ');

    res.json({
      message: 'Profil mis à jour avec succès',
      user: { ...userObj, firstName, lastName }
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
 * POST /api/auth/close-account
 * Fermer le compte utilisateur (inactivation)
 */
router.post('/close-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier les commandes en cours
    // Ongoing statuses according to typical flowchart: pending, processing, shipped, on-hold
    const ongoingOrders = await Order.findOne({
      where: {
        user_id: userId,
        status: {
          [Op.in]: ['pending', 'processing', 'shipped', 'on-hold']
        }
      }
    });

    if (ongoingOrders) {
      return res.status(400).json({
        error: 'Commandes en cours',
        message: 'Vous ne pouvez pas fermer votre compte tant que vous avez des commandes en cours (en attente, en préparation ou en cours de livraison).'
      });
    }

    // Marquer l'utilisateur comme inactif
    await User.update(
      { status: 'Inactif' },
      { where: { id: userId } }
    );

    res.json({
      message: 'Votre compte a été fermé avec succès. Vous allez être déconnecté.'
    });

  } catch (error) {
    console.error('Erreur fermeture compte:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la fermeture du compte'
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
        role: req.user.role,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Set HttpOnly Cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      domain: process.env.COOKIE_DOMAIN
    });

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
    const { search } = req.query;

    const whereClause = {
      role: { [Op.in]: ['admin', 'gestionnaire'] }
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
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

/**
 * GOOGLE AUTH ROUTES
 */
import passport from 'passport';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('❌ Google Auth Error:', err);
        return res.redirect('/login?error=auth_failed&message=' + encodeURIComponent(err.message));
      }
      if (!user) {
        console.error('❌ Google Auth Failed: No user returned', info);
        return res.redirect('/login?error=auth_failed&reason=no_user');
      }

      // Successful authentication
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          lastActivity: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Set Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24h
        domain: process.env.COOKIE_DOMAIN
      });

      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

/**
 * FACEBOOK AUTH ROUTES
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook_failed' }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        lastActivity: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Set Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      domain: process.env.COOKIE_DOMAIN
    });

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

/**
 * POST /api/auth/forgot-password
 * Demander la réinitialisation du mot de passe
 */
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Pour des raisons de sécurité, on ne dit pas si l'utilisateur existe ou non
    // sauf si on veut explicitement le debug
    if (!user) {
      return res.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
      });
    }

    // Générer le token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 heure

    // Sauvegarder dans la DB
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires
    });

    // Envoyer l'email
    // En production: utiliser une vraie URL frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const message = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte htfasil.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    `;

    await sendEmail(
      user.email,
      'Réinitialisation de mot de passe - htfasil',
      message
    );

    res.json({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
    });

  } catch (error) {
    console.error('Erreur forgot-password:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec le token
 */
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Rechercher l'utilisateur avec le token valide et non expiré
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() } // Doit être supérieur à maintenant
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Lien invalide ou expiré',
        message: 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour et nettoyer les tokens
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({
      message: 'Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.'
    });

  } catch (error) {
    console.error('Erreur reset-password:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
