import express from 'express';
import { Review, User, Product } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/reviews/product/:productId
 * Récupérer les avis d'un produit
 */
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: {
                product_id: productId,
                status: 'approved' // Only show approved reviews
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'] // Show name/email
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
    }
});

/**
 * POST /api/reviews
 * Ajouter un avis (Nécessite authentification)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.userId; // Provided by authenticateToken

        if (!product_id || !rating) {
            return res.status(400).json({ error: 'Produit et note requis' });
        }

        // Verify product exists
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Check if user already reviewed? (Optional, skipping for now)

        const review = await Review.create({
            product_id,
            user_id,
            rating,
            comment,
            status: 'approved' // Auto-approve for now
        });

        // Fetch complete review with user data to return
        const fullReview = await Review.findByPk(review.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        });

        res.status(201).json(fullReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
    }
});

/**
 * DELETE /api/reviews/:id
 * Supprimer un avis (Admin ou Propriétaire? Admin only for simplicity otherwise specific check)
 * Let's assume User can delete own review? Or Admin?
 * Using standard admin/user usage.
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Avis non trouvé' });
        }

        // Check ownership or admin role (assuming role is in token or we fetch user)
        // For now, simpler: user matches or 403.
        // Ideally check req.user.role === 'admin'

        if (review.user_id !== req.user.userId) {
            // Check if admin (optional, assuming req.user doesn't have role yet in standard auth middleware payload unless customized)
            // Let's stick to owner deletion for now
            return res.status(403).json({ error: 'Non autorisé' });
        }

        await review.destroy();
        res.json({ message: 'Avis supprimé' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

export default router;
