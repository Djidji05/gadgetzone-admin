import express from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User, Store } from '../models/index.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { notifyNewSystemUser } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/users
 * Search users by name (Admins & Gestionnaires by default)
 */
router.get('/', authenticateToken, hasPermission('manage_users'), async (req, res) => {
    try {
        const { search, role } = req.query;
        const whereClause = {};
        if (role) {
            whereClause.role = role;
        } else {
            // Par défaut, ne montrer que les administrateurs et gestionnaires
            whereClause.role = { [Op.in]: ['admin', 'gestionnaire'] };
        }

        const userWhere = {};
        if (search) {
            userWhere[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where: {
                ...whereClause,
                ...userWhere
            },
            include: [
                {
                    model: Store,
                    as: 'store',
                    required: false
                }
            ],
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/users
 * Create a new admin or gestionnaire
 */
router.post('/', authenticateToken, hasPermission('manage_users'), async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                error: 'Champs requis',
                message: 'Tous les champs sont obligatoires'
            });
        }

        // Valider le rôle (uniquement admin ou gestionnaire via cette route)
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

        // Notification
        await notifyNewSystemUser(newUser);

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: userResponse
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', authenticateToken, hasPermission('manage_users'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Store,
                    as: 'store',
                    required: false
                }
            ],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/users/:id
 * Update an existing user
 */
router.put('/:id', authenticateToken, hasPermission('manage_users'), async (req, res) => {
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
                where: { email, id: { [Op.ne]: userId } }
            });
            if (existingUser) {
                return res.status(409).json({ error: 'Cet email est déjà utilisé' });
            }
        }

        const updates = {};
        if (firstName && lastName) updates.name = `${firstName} ${lastName}`;
        if (email) updates.email = email;
        if (role) {
            // Sécurité: ne pas permettre de changer en dehors des rôles système ici
            if (['admin', 'gestionnaire'].includes(role)) {
                updates.role = role;
            }
        }
        if (phone !== undefined) updates.phone = phone;

        if (password && password.trim() !== '') {
            const saltRounds = 12;
            updates.password = await bcrypt.hash(password, saltRounds);
        }

        await user.update(updates);

        res.json({ message: 'Utilisateur mis à jour avec succès', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', authenticateToken, hasPermission('manage_users'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Ne pas se supprimer soi-même
        if (user.id === req.user.userId) {
            return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        await user.destroy();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
