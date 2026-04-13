import express from 'express';
import { Store, User, OrderLog, Product, DisputeMessage, Order } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import { Op } from 'sequelize';

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

        // Get stores with their owners in one query
        const stores = await Store.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const count = await Store.count({ where: whereClause });

        // Map results for consumer consistency
        const applications = stores.map(store => {
            const storeData = store.get({ plain: true });
            return storeData;
        });

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
 * GET /api/admin/vendors/applications/:id
 * Get a single vendor application detail
 * Access: Admin only
 */
router.get('/applications/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ error: 'Candidature non trouvée' });
        }

        const storeData = store.get({ plain: true });
        const userId = storeData.userId || storeData.user_id;

        let owner = null;
        if (userId) {
            owner = await User.findByPk(userId, {
                attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at']
            });
        }

        res.json({
            application: {
                ...storeData,
                owner: owner ? owner.get({ plain: true }) : null
            }
        });
    } catch (error) {
        console.error('Get vendor application detail error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Erreur lors de la récupération des détails de la candidature'
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

/**
 * GET /api/admin/vendors/recent-actions
 * Get a unified timeline of recent vendor activities
 * Access: Admin only
 */
router.get('/recent-actions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 15;
        let actions = [];

        // Get all sellers IDs to filter easily without doing complex alias joins
        const sellers = await User.findAll({
            where: { role: 'seller' },
            attributes: ['id', 'name']
        });

        const sellerIds = sellers.map(s => s.id);
        const sellerMap = {};
        sellers.forEach(s => sellerMap[s.id] = s);

        // 🚀 Optimisation : Récupérer toutes les activités en parallèle
        const [orderLogs, disputeMsgs, newProducts] = await Promise.all([
            // 1. Get recent order status changes by sellers
            OrderLog.findAll({
                where: { user_id: { [Op.in]: sellerIds } },
                order: [['created_at', 'DESC']],
                limit: limit,
                raw: true
            }),
            // 2. Get recent dispute messages from sellers
            DisputeMessage.findAll({
                where: { sender_id: { [Op.in]: sellerIds } },
                order: [['created_at', 'DESC']],
                limit: limit,
                raw: true
            }),
            // 3. Get recent products added by sellers
            Product.findAll({
                where: { storeId: { [Op.ne]: null } },
                include: [
                    {
                        model: Store,
                        as: 'store',
                        required: true,
                        include: [{ model: User, as: 'owner', attributes: ['name'] }]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: limit,
                raw: true,
                nest: true
            })
        ]);

        newProducts.forEach(prod => {
            const vendorName = prod.store && prod.store.owner ? prod.store.owner.name : (prod.store ? prod.store.name : 'Vendeur');
            actions.push({
                id: `prod-${prod.id}`,
                vendorName: vendorName,
                actionType: 'product',
                color: 'purple',
                description: `a ajouté un nouveau produit : ${prod.name}`,
                timestamp: prod.created_at,
                link: `/vendeurs/produits`
            });
        });

        // Sort combined actions by timestamp descending
        actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Take only the requested limit overall
        const finalActions = actions.slice(0, limit);

        res.json({
            actions: finalActions
        });

    } catch (error) {
        console.error('Error fetching vendor recent actions:', error);
        res.status(500).json({ error: 'Failed to fetch vendor actions', details: error.message });
    }
});

export default router;
