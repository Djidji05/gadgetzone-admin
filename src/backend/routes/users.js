import express from 'express';
import { Op } from 'sequelize';
import { User, Store } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Search users by name or store name
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, role } = req.query;

        const whereClause = {};
        if (role) {
            whereClause.role = role;
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
            limit: 20
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/users/:id
 * Get user by ID with store details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                {
                    model: StoreSetting,
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

export default router;
