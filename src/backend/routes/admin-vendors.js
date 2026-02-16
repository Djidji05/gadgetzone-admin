import express from 'express';
import { Store, User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/admin/vendors/applications
 * Get all vendor applications with optional status filter
 * Access: Admin only
 */
router.get('/applications', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        const whereClause = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }

        // Get stores
        const stores = await Store.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const count = await Store.count({ where: whereClause });

        // Manually fetch users for each store
        const applications = await Promise.all(stores.map(async (store) => {
            const storeData = store.get({ plain: true });

            // Try both property names (camelCase from model definition, or snake_case from DB)
            const ownerId = storeData.userId || storeData.user_id;

            let owner = null;
            if (ownerId) {
                owner = await User.findByPk(ownerId, {
                    attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at']
                });
            }

            return {
                ...storeData,
                owner: owner ? owner.get({ plain: true }) : null
            };
        }));

        // Count by status
        const pendingCount = await Store.count({ where: { status: 'pending' } });
        const activeCount = await Store.count({ where: { status: 'active' } });
        const suspendedCount = await Store.count({ where: { status: 'suspended' } });
        const closedCount = await Store.count({ where: { status: 'closed' } });

        const counts = {
            pending: pendingCount,
            active: activeCount,
            suspended: suspendedCount,
            closed: closedCount
        };

        res.json({
            applications,
            total: count,
            counts,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: count
            }
        });
    } catch (error) {
        console.error('Get vendor applications error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors de la récupération des candidatures'
        });
    }
});

/**
 * PUT /api/admin/vendors/applications/:id/approve
 * Approve a vendor application
 * Access: Admin only
 */
router.put('/applications/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Fix: handle both snake_case (DB) and camelCase (Model)
        const userId = store.userId || store.user_id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: `User not found (ID: ${userId})` });
        }

        // Update store status and clear reason
        store.status = 'active';
        const settings = store.settings || {};
        if (settings.statusReason) {
            const { statusReason, ...rest } = settings;
            store.settings = rest;
        }
        await store.save();

        // Update user role to seller
        user.role = 'seller';
        await user.save();

        // Notify vendor
        await createNotification(
            user.id,
            'success',
            '🎉 Candidature approuvée !',
            `Félicitations ! Votre boutique "${store.name}" a été approuvée. Vous pouvez maintenant commencer à vendre vos produits.`,
            {
                relatedId: store.id,
                relatedType: 'store'
            }
        );

        res.json({
            message: 'Application approved successfully',
            store: store.get({ plain: true })
        });
    } catch (error) {
        console.error('Approve application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors de l\'approbation'
        });
    }
});

/**
 * PUT /api/admin/vendors/applications/:id/reject
 * Reject a vendor application
 * Access: Admin only
 */
router.put('/applications/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Fix: handle both snake_case (DB) and camelCase (Model)
        const userId = store.userId || store.user_id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: `User not found (ID: ${userId})` });
        }

        // Update store status and save reason
        store.status = 'closed';
        const settings = store.settings || {};
        store.settings = { ...settings, statusReason: reason };
        await store.save();

        // Notify vendor
        const message = reason
            ? `Votre candidature pour la boutique "${store.name}" a été rejetée. Raison: ${reason}`
            : `Votre candidature pour la boutique "${store.name}" a été rejetée.`;

        await createNotification(
            user.id,
            'error',
            '❌ Candidature rejetée',
            message,
            {
                relatedId: store.id,
                relatedType: 'store',
                metadata: { reason }
            }
        );

        res.json({
            message: 'Application rejected',
            store: store.get({ plain: true })
        });
    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors du rejet'
        });
    }
});

/**
 * PUT /api/admin/vendors/applications/:id/suspend
 * Suspend a vendor
 * Access: Admin only
 */
router.put('/applications/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Fix: handle both snake_case (DB) and camelCase (Model)
        const userId = store.userId || store.user_id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: `User not found (ID: ${userId})` });
        }

        // Update store status and save reason
        store.status = 'suspended';
        const settings = store.settings || {};
        store.settings = { ...settings, statusReason: reason };
        await store.save();

        // Notify vendor
        const message = reason
            ? `Votre boutique "${store.name}" a été suspendue. Raison: ${reason}`
            : `Votre boutique "${store.name}" a été suspendue.`;

        await createNotification(
            user.id,
            'warning',
            '⚠️ Boutique suspendue',
            message,
            {
                relatedId: store.id,
                relatedType: 'store',
                metadata: { reason }
            }
        );

        res.json({
            message: 'Vendor suspended',
            store: store.get({ plain: true })
        });
    } catch (error) {
        console.error('Suspend vendor error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors de la suspension'
        });
    }
});

/**
 * PUT /api/admin/vendors/applications/:id/reactivate
 * Reactivate a suspended vendor
 * Access: Admin only
 */
router.put('/applications/:id/reactivate', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Fix: handle both snake_case (DB) and camelCase (Model)
        const userId = store.userId || store.user_id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: `User not found (ID: ${userId})` });
        }

        // Update store status and clear reason
        store.status = 'active';
        const settings = store.settings || {};
        if (settings.statusReason) {
            const { statusReason, ...rest } = settings;
            store.settings = rest;
        }
        await store.save();

        // Notify vendor
        await createNotification(
            user.id,
            'success',
            '✅ Boutique réactivée',
            `Votre boutique "${store.name}" a été réactivée. Vous pouvez à nouveau vendre vos produits.`,
            {
                relatedId: store.id,
                relatedType: 'store'
            }
        );

        res.json({
            message: 'Vendor reactivated',
            store: store.get({ plain: true })
        });
    } catch (error) {
        console.error('Reactivate vendor error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors de la réactivation'
        });
    }
});

export default router;
