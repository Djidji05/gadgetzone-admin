import express from 'express';
import Role from '../models/Role.js';
import { User } from '../models/index.js';

const router = express.Router();

// Get all roles with user counts
router.get('/', async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [['name', 'ASC']]
        });

        // Get user counts for each role
        const rolesWithCounts = await Promise.all(
            roles.map(async (role) => {
                const userCount = await User.count({
                    where: { role: role.name.toLowerCase() }
                });

                return {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions,
                    isSystem: role.isSystem,
                    usersCount: userCount,
                    createdAt: role.createdAt,
                    updatedAt: role.updatedAt
                };
            })
        );

        res.json({ roles: rolesWithCounts });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des rôles' });
    }
});

// Get single role
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        res.json(role);
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du rôle' });
    }
});

// Create role
router.post('/', async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ message: 'Erreur lors de la création du rôle' });
    }
});

// Update role
router.put('/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        // Prevent modification of system roles
        if (role.isSystem && req.body.isSystem === false) {
            return res.status(403).json({ message: 'Les rôles système ne peuvent pas être modifiés' });
        }

        await role.update(req.body);
        res.json(role);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
    }
});

// Delete role
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        // Prevent deletion of system roles
        if (role.isSystem) {
            return res.status(403).json({ message: 'Les rôles système ne peuvent pas être supprimés' });
        }

        // Check if role is in use
        const userCount = await User.count({
            where: { role: role.name.toLowerCase() }
        });

        if (userCount > 0) {
            return res.status(400).json({
                message: `Ce rôle est utilisé par ${userCount} utilisateur(s) et ne peut pas être supprimé`
            });
        }

        await role.destroy();
        res.json({ message: 'Rôle supprimé avec succès' });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du rôle' });
    }
});

export default router;
