import express from 'express';
import { Dispute, DisputeMessage, Order, OrderItem, Product, User, Store } from '../models/index.js';
import { authenticateToken, requireAdmin, isSeller, checkStoreActive } from '../middleware/auth.js';
import { notifyNewDispute, notifyNewDisputeMessage } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/disputes
 * Lister tous les litiges (Admin uniquement)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const disputes = await Dispute.findAll({
            include: [
                { model: Order },
                { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(disputes);
    } catch (error) {
        console.error('Error fetching all disputes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des litiges' });
    }
});

/**
 * POST /api/disputes
 * Ouvrir un nouveau litige
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { order_id, reason, description } = req.body;
        const user_id = req.user.id;

        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

        // Vérifier que la commande appartient à l'utilisateur
        if (order.user_id !== user_id) return res.status(403).json({ error: 'Action non autorisée' });

        const dispute = await Dispute.create({
            order_id,
            user_id,
            reason,
            description,
            status: 'pending'
        });

        // Notifier les vendeurs et admins
        notifyNewDispute(dispute);

        res.status(201).json(dispute);
    } catch (error) {
        console.error('Error creating dispute:', error);
        res.status(500).json({ error: 'Erreur lors de la création du litige' });
    }
});

/**
 * GET /api/disputes/me
 * Lister les litiges de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const disputes = await Dispute.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Order, attributes: ['id', 'status', 'total_amount'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(disputes);
    } catch (error) {
        console.error('Error fetching my disputes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des litiges' });
    }
});

/**
 * GET /api/disputes/seller
 * Lister les litiges liés aux commandes de la boutique du vendeur
 */
router.get('/seller', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;

        const disputes = await Dispute.findAll({
            include: [
                {
                    model: Order,
                    required: true,
                    include: [{
                        model: OrderItem,
                        as: 'items',
                        required: true,
                        include: [{
                            model: Product,
                            as: 'product',
                            where: { storeId },
                            required: true
                        }]
                    }]
                },
                { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(disputes);
    } catch (error) {
        console.error('Error fetching seller disputes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des litiges vendeur' });
    }
});

/**
 * GET /api/disputes/:id
 * Détails d'un litige avec messages
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const dispute = await Dispute.findByPk(req.params.id, {
            include: [
                {
                    model: Order,
                    include: [{
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product',
                            include: [{ model: Store, as: 'store', attributes: ['id', 'name'] }]
                        }]
                    }]
                },
                {
                    model: DisputeMessage,
                    as: 'messages',
                    separate: true,
                    order: [['created_at', 'ASC']],
                    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }]
                },
                { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
            ]
        });

        if (!dispute) return res.status(404).json({ error: 'Litige non trouvé' });

        // Seul l'admin, l'auteur du litige ou le vendeur concerné peut voir les détails
        let isAuthorized = dispute.user_id === req.user.id || req.user.role === 'admin';

        if (!isAuthorized && req.user.role === 'seller') {
            const store = await Store.findOne({ where: { userId: req.user.id } });
            if (store) {
                const count = await OrderItem.count({
                    where: { order_id: dispute.order_id },
                    include: [{
                        model: Product,
                        as: 'product',
                        where: { storeId: store.id }
                    }]
                });
                if (count > 0) isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        res.json(dispute);
    } catch (error) {
        console.error('Error fetching dispute:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du litige' });
    }
});

/**
 * POST /api/disputes/:id/messages
 * Envoyer un message dans un litige
 */
router.post('/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const dispute_id = req.params.id;
        const sender_id = req.user.id;

        const dispute = await Dispute.findByPk(dispute_id);
        if (!dispute) return res.status(404).json({ error: 'Litige non trouvé' });

        // Vérifier accès (Admin, Client ou Vendeur concerné)
        let isAuthorized = dispute.user_id === sender_id || req.user.role === 'admin';

        if (!isAuthorized && req.user.role === 'seller') {
            const { Store } = await import('../models/index.js');
            const store = await Store.findOne({ where: { userId: req.user.id } });
            if (store) {
                const count = await OrderItem.count({
                    where: { order_id: dispute.order_id },
                    include: [{
                        model: Product,
                        as: 'product',
                        where: { storeId: store.id }
                    }]
                });
                if (count > 0) isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const disputeMessage = await DisputeMessage.create({
            dispute_id,
            sender_id,
            message
        });

        // Notifier les parties concernées
        notifyNewDisputeMessage(dispute, disputeMessage);

        res.status(201).json(disputeMessage);
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
});

/**
 * PATCH /api/disputes/:id/status
 * Mettre à jour le statut (Admin uniquement)
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const dispute = await Dispute.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ error: 'Litige non trouvé' });

        dispute.status = status;
        dispute.updated_at = new Date();
        await dispute.save();

        res.json(dispute);
    } catch (error) {
        console.error('Error updating dispute status:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

export default router;
