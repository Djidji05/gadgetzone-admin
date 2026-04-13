import reviewRepository from '../repositories/ReviewRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class ReviewService {
    async getProductReviews(productId) {
        return await reviewRepository.findByProduct(productId);
    }

    async addReview(userId, reviewData) {
        const { product_id, rating, comment } = reviewData;

        if (!product_id || !rating) {
            throw new Error('Produit et note requis');
        }

        const productRepo = new ProductRepository();
        const product = await productRepo.findById(product_id);
        if (!product) {
            throw new Error('Produit non trouvé');
        }

        const review = await reviewRepository.create({
            product_id,
            user_id: userId,
            rating,
            comment,
            status: 'pending'
        });

        return await reviewRepository.findFullReview(review.id);
    }

    async deleteReview(reviewId, userId, isAdmin = false) {
        const review = await reviewRepository.findById(reviewId);

        if (!review) {
            throw new Error('Avis non trouvé');
        }

        if (review.user_id !== userId && !isAdmin) {
            throw new Error('Non autorisé');
        }

        return await reviewRepository.delete(reviewId);
    }

    async getPendingReviews() {
        return await reviewRepository.findPending();
    }

    async updateStatus(reviewId, status) {
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            throw new Error('Statut invalide');
        }

        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new Error('Avis non trouvé');
        }

        return await reviewRepository.update(reviewId, { status });
    }
}

export default new ReviewService();
