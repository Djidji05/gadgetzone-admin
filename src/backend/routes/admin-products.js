import express from 'express';
import { Product, Store, User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/admin/products/moderation
 * Liste les produits en attente de modération
 */
router.get('/moderation', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status = 'pending', limit = 50, offset = 0 } = req.query;

        const { count, rows } = await Product.findAndCountAll({
            where: { moderation_status: status },
            include: [{
                model: Store,
                as: 'store',
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            products: rows,
            total: count,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: count
            }
        });
    } catch (error) {
        console.error('Get product moderation error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits' });
    }
});

/**
 * PUT /api/admin/products/:id/approve
 * Approuve un produit
 */
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [{ model: Store, as: 'store' }]
        });

        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        product.moderation_status = 'approved';
        product.status = 'active'; // S'assurer qu'il soit actif
        await product.save();

        // Ensure it's indexed in Meilisearch
        const ProductService = (await import('../services/ProductService.js')).default;
        const productService = new ProductService();
        const detailedProduct = await productService.repository.findWithDetails(id);
        if (detailedProduct) {
            const searchService = (await import('../services/SearchService.js')).default;
            await searchService.indexProduct(detailedProduct);
        }

        // Notifier le vendeur
        if (product.store && product.store.userId) {
            await createNotification(
                product.store.userId,
                'success',
                '✅ Produit approuvé',
                `Votre produit "${product.name}" a été approuvé et est maintenant en ligne.`,
                {
                    relatedId: product.id,
                    relatedType: 'product'
                }
            );
        }

        res.json({ message: 'Produit approuvé', product });
    } catch (error) {
        console.error('Approve product error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'approbation du produit' });
    }
});

/**
 * PUT /api/admin/products/:id/reject
 * Rejette un produit
 */
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const product = await Product.findByPk(id, {
            include: [{ model: Store, as: 'store' }]
        });

        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        product.moderation_status = 'rejected';
        product.admin_note = reason || product.admin_note;
        await product.save();

        // Notifier le vendeur
        if (product.store && product.store.userId) {
            await createNotification(
                product.store.userId,
                'error',
                '❌ Produit rejeté',
                `Votre produit "${product.name}" a été rejeté. Raison: ${reason || 'Non spécifiée'}`,
                {
                    relatedId: product.id,
                    relatedType: 'product'
                }
            );
        }

        res.json({ message: 'Produit rejeté', product });
    } catch (error) {
        console.error('Reject product error:', error);
        res.status(500).json({ error: 'Erreur serveur lors du rejet du produit' });
    }
});

export default router;
