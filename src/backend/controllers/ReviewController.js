import reviewService from '../services/ReviewService.js';
import { apiLogger } from '../utils/logger.js';

class ReviewController {
    async getByProduct(req, res) {
        try {
            const reviews = await reviewService.getProductReviews(req.params.productId);
            res.json(reviews);
        } catch (error) {
            apiLogger.error('Get Reviews Error', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
        }
    }

    async create(req, res) {
        try {
            const userId = req.user?.userId || req.user?.id;
            
            // 🛡️ SÉCURISATION MASS ASSIGNMENT : Filtrer les champs
            const { productId, rating, comment } = req.body;
            const reviewData = {
                productId,
                rating,
                comment,
                status: 'pending' // Forcer la modération par défaut
            };

            const review = await reviewService.addReview(userId, reviewData);
            res.status(201).json(review);
        } catch (error) {
            console.error("❌ CREATE REVIEW ERROR DETAILS:", error.message);
            apiLogger.error('Create Review Error', error);
            const status = error.message === 'Produit non trouvé' ? 404 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const isAdmin = req.user.role === 'admin';
            await reviewService.deleteReview(req.params.id, userId, isAdmin);
            res.json({ message: 'Avis supprimé' });
        } catch (error) {
            apiLogger.error('Delete Review Error', error);
            const status = error.message === 'Non autorisé' ? 403 : (error.message === 'Avis non trouvé' ? 404 : 500);
            res.status(status).json({ error: error.message });
        }
    }

    async getPending(req, res) {
        try {
            const reviews = await reviewService.getPendingReviews();
            res.json(reviews);
        } catch (error) {
            apiLogger.error('Get Pending Reviews Error', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des avis en attente' });
        }
    }

    async moderate(req, res) {
        try {
            const review = await reviewService.updateStatus(req.params.id, req.body.status);
            res.json(review);
        } catch (error) {
            apiLogger.error('Moderate Review Error', error);
            const status = error.message === 'Statut invalide' ? 400 : (error.message === 'Avis non trouvé' ? 404 : 500);
            res.status(status).json({ error: error.message });
        }
    }
}

export default new ReviewController();
