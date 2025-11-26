import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
} from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'user' } = req.body;

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
      role
    });

    // Créer le token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
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
      role: user.role,
      created_at: user.created_at
    };

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      customer: userResponse,
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
router.post('/login', validateLogin, async (req, res) => {
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
      { userId: user.id, email: user.email },
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
      customer: userResponse,
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
    const { name, email } = req.body;
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
      { name, email },
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

export default router;
