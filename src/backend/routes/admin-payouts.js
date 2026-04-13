import express from 'express';
import { Payout, Store, User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/admin/payouts
 * Liste toutes les demandes de retrait
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        const where = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        const { count, rows } = await Payout.findAndCountAll({
            where,
            include: [{
                model: Store,
                as: 'store',
                attributes: ['id', 'name', 'logoUrl']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            payouts: rows,
            total: count,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: count
            }
        });
    } catch (error) {
        console.error('Get admin payouts error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des paiements' });
    }
});

/**
 * PUT /api/admin/payouts/:id/approve
 * Approuve une demande de retrait
 */
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const payout = await Payout.findByPk(id, {
            include: [{ model: Store, as: 'store' }]
        });

        if (!payout) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({ error: 'Seuls les paiements en attente peuvent être approuvés' });
        }

        payout.status = 'completed';
        payout.reference = req.body.reference || payout.reference;
        payout.adminNote = req.body.adminNote || payout.adminNote;
        await payout.save();

        // Notifier le vendeur
        if (payout.store && payout.store.userId) {
            await createNotification(
                payout.store.userId,
                'success',
                '💸 Retrait traité',
                `Votre demande de retrait de ${payout.amount} HTG a été traitée avec succès.`,
                {
                    relatedId: payout.id,
                    relatedType: 'payout'
                }
            );
        }

        res.json({ message: 'Paiement approuvé', payout });
    } catch (error) {
        console.error('Approve payout error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'approbation du paiement' });
    }
});

/**
 * PUT /api/admin/payouts/:id/reject
 * Rejette une demande de retrait
 */
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const payout = await Payout.findByPk(id, {
            include: [{ model: Store, as: 'store' }]
        });

        if (!payout) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        payout.status = 'failed';
        payout.adminNote = reason || payout.adminNote;
        await payout.save();

        // Notifier le vendeur
        if (payout.store && payout.store.userId) {
            await createNotification(
                payout.store.userId,
                'error',
                '❌ Retrait rejeté',
                `Votre demande de retrait de ${payout.amount} HTG a été rejetée. Raison: ${reason || 'Non spécifiée'}`,
                {
                    relatedId: payout.id,
                    relatedType: 'payout'
                }
            );
        }

        res.json({ message: 'Paiement rejeté', payout });
    } catch (error) {
        console.error('Reject payout error:', error);
        res.status(500).json({ error: 'Erreur serveur lors du rejet du paiement' });
    }
});

export default router;
