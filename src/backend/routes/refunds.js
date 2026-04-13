import express from 'express';
import { Op } from 'sequelize';
import { Order, User, Refund } from '../models/index.js';

const router = express.Router();

// Taux de frais par méthode de paiement (en %)
const FEE_RATES = {
    'MonCash': 2.0,
    'Natcash': 2.0,
    'Carte de crédit': 3.0,
    'Zelle': 1.0,
    'Espèces': 0.0,
    'Virement': 0.0,
    'default': 2.0
};

const getFeeRate = (method) => FEE_RATES[method] ?? FEE_RATES['default'];

/**
 * GET /api/refunds/pending-orders
 * Commandes annulées sans remboursement créé
 */
router.get('/pending-orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { status: 'cancelled' },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: Refund,
                    as: 'refund',
                    required: false // LEFT JOIN - inclure même sans remboursement
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Filtrer celles sans remboursement
        const pendingRefunds = orders.filter(o => !o.refund);

        res.json(pendingRefunds.map(o => ({
            id: o.id,
            order_number: `CMD-${String(o.id).padStart(5, '0')}`,
            customer: o.user,
            total_amount: parseFloat(o.total_amount),
            payment_method: o.payment_method || null,
            cancelled_at: o.cancelled_at || o.updated_at,
            created_at: o.created_at,
            suggested_fee_rate: o.payment_method ? getFeeRate(o.payment_method) : null
        })));
    } catch (error) {
        console.error('Erreur pending-orders refunds:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/refunds
 * Liste tous les remboursements avec filtres
 */
router.get('/', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};
        if (status && status !== 'all') where.status = status;

        const { count, rows } = await Refund.findAndCountAll({
            where,
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'total_amount', 'created_at']
                },
                {
                    model: User,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'processor',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            refunds: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Erreur liste refunds:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/refunds/stats
 * Statistiques des remboursements
 */
router.get('/stats', async (req, res) => {
    try {
        const [pending, processing, completed, failed] = await Promise.all([
            Refund.count({ where: { status: 'pending' } }),
            Refund.count({ where: { status: 'processing' } }),
            Refund.count({ where: { status: 'completed' } }),
            Refund.count({ where: { status: 'failed' } })
        ]);

        const [totalRefunded] = await Refund.findAll({
            where: { status: 'completed' },
            attributes: [
                [Refund.sequelize.fn('SUM', Refund.sequelize.col('refund_amount')), 'total'],
                [Refund.sequelize.fn('SUM', Refund.sequelize.col('fee_amount')), 'total_fees']
            ],
            raw: true
        });

        res.json({
            pending,
            processing,
            completed,
            failed,
            total: pending + processing + completed + failed,
            total_refunded: parseFloat(totalRefunded?.total || 0),
            total_fees_collected: parseFloat(totalRefunded?.total_fees || 0)
        });
    } catch (error) {
        console.error('Erreur stats refunds:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/refunds
 * Créer un remboursement pour une commande annulée
 */
router.post('/', async (req, res) => {
    try {
        const { order_id, payment_method, fee_rate_override, notes, admin_id } = req.body;

        if (!order_id || !payment_method) {
            return res.status(400).json({ error: 'order_id et payment_method sont requis' });
        }

        // Vérifier que la commande existe et est annulée
        const order = await Order.findByPk(order_id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        });

        if (!order) return res.status(404).json({ error: 'Commande introuvable' });
        if (order.status !== 'cancelled') {
            return res.status(400).json({ error: 'Seules les commandes annulées peuvent être remboursées' });
        }

        // Vérifier qu'il n'y a pas déjà un remboursement
        const existing = await Refund.findOne({ where: { order_id } });
        if (existing) {
            return res.status(409).json({ error: 'Un remboursement existe déjà pour cette commande' });
        }

        // Calculer les frais
        const feeRate = fee_rate_override !== undefined ? parseFloat(fee_rate_override) : getFeeRate(payment_method);
        const originalAmount = parseFloat(order.total_amount);
        const feeAmount = parseFloat((originalAmount * feeRate / 100).toFixed(2));
        const refundAmount = parseFloat((originalAmount - feeAmount).toFixed(2));

        const refund = await Refund.create({
            order_id,
            user_id: order.user_id,
            original_amount: originalAmount,
            fee_rate: feeRate,
            fee_amount: feeAmount,
            refund_amount: refundAmount,
            payment_method,
            status: 'pending',
            notes: notes || null,
            processed_by: admin_id || null,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({
            ...refund.toJSON(),
            customer: order.user,
            order_number: `CMD-${String(order.id).padStart(5, '0')}`
        });
    } catch (error) {
        console.error('Erreur création refund:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/refunds/:id/process
 * Marquer comme en cours de traitement (avec référence de transaction)
 */
router.patch('/:id/process', async (req, res) => {
    try {
        const { reference, notes, admin_id } = req.body;
        const refund = await Refund.findByPk(req.params.id);
        if (!refund) return res.status(404).json({ error: 'Remboursement introuvable' });

        await refund.update({
            status: 'processing',
            reference: reference || refund.reference,
            notes: notes || refund.notes,
            processed_by: admin_id || refund.processed_by,
            processed_at: new Date(),
            updated_at: new Date()
        });

        res.json(refund);
    } catch (error) {
        console.error('Erreur process refund:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/refunds/:id/complete
 * Marquer comme complété
 */
router.patch('/:id/complete', async (req, res) => {
    try {
        const { reference, notes } = req.body;
        const refund = await Refund.findByPk(req.params.id);
        if (!refund) return res.status(404).json({ error: 'Remboursement introuvable' });

        await refund.update({
            status: 'completed',
            reference: reference || refund.reference,
            notes: notes || refund.notes,
            processed_at: refund.processed_at || new Date(),
            updated_at: new Date()
        });

        res.json(refund);
    } catch (error) {
        console.error('Erreur complete refund:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/refunds/:id/fail
 * Marquer comme échoué
 */
router.patch('/:id/fail', async (req, res) => {
    try {
        const { failure_reason } = req.body;
        const refund = await Refund.findByPk(req.params.id);
        if (!refund) return res.status(404).json({ error: 'Remboursement introuvable' });

        await refund.update({
            status: 'failed',
            failure_reason: failure_reason || 'Raison non spécifiée',
            updated_at: new Date()
        });

        res.json(refund);
    } catch (error) {
        console.error('Erreur fail refund:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
