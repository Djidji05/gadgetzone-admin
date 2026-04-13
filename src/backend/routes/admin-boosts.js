import express from 'express';
import { Boost, Store, Product } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/boosts
 * Récupérer tous les boosts pour l'interface administrateur
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const boosts = await Boost.findAll({
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image_url']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(boosts);
    } catch (error) {
        console.error('Erreur lors de la récupération des boosts (Admin):', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

/**
 * DELETE /api/admin/boosts/:id
 * Supprimer ou annuler un boost (Optionnel)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const boost = await Boost.findByPk(req.params.id);
        if (!boost) {
            return res.status(404).json({ error: 'Boost non trouvé' });
        }

        // Si on annule un boost actif, il faut aussi retirer le statut sponsorisé du produit
        if (boost.status === 'active') {
            await Product.update(
                { is_sponsored: false },
                { where: { id: boost.productId } }
            );
        }

        await boost.destroy();
        res.json({ message: 'Boost supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du boost:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
