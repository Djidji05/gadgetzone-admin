import { Order, Review, Store, OrderItem, Product } from '../models/index.js';

export default class TrustScoreService {
    /**
     * Calcule le score de confiance d'une boutique.
     * Score sur 100.
     */
    static async calculateStoreScore(storeId) {
        try {
            const store = await Store.findByPk(storeId);
            if (!store) return 0;

            // 1. Taux de succès des commandes (60% du score)
            // On récupère toutes les commandes liées aux produits de ce store
            const orders = await Order.findAll({
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
            });

            const totalOrders = orders.length;
            if (totalOrders === 0) return 100; // Nouveau vendeur, score neutre/max

            const successfulOrders = orders.filter(o => o.status === 'delivered').length;
            const successRate = (successfulOrders / totalOrders) * 100;

            // 2. Moyenne des avis (30% du score)
            const reviews = await Review.findAll({
                include: [{
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    required: true
                }]
            });

            const avgRating = reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) 
                : 5; // 5 par défaut si pas d'avis
            const ratingScore = (avgRating / 5) * 100;

            // 3. Rapidité de livraison (10% du score)
            // Moyenne du temps entre 'confirmed' et 'shipped'
            const deliveredOrders = orders.filter(o => o.status === 'delivered' && o.confirmed_at && o.shipped_at);
            let speedScore = 100;
            if (deliveredOrders.length > 0) {
                const avgSpeed = deliveredOrders.reduce((acc, o) => {
                    const diff = new Date(o.shipped_at) - new Date(o.confirmed_at);
                    return acc + diff;
                }, 0) / deliveredOrders.length;
                
                // Si moyenne \u003c 24h = 100 pts, \u003e 72h = 0 pts
                const hours = avgSpeed / (1000 * 60 * 60);
                if (hours <= 24) speedScore = 100;
                else if (hours >= 72) speedScore = 0;
                else speedScore = 100 - ((hours - 24) / 48) * 100;
            }

            // Calcul final pondéré
            const finalScore = (successRate * 0.6) + (ratingScore * 0.3) + (speedScore * 0.1);
            
            // Mise à jour de la boutique
            await store.update({ 
                trust_score: Math.min(100, Math.max(0, finalScore)),
                total_sales_count: successfulOrders
            });

            return finalScore;
        } catch (error) {
            console.error('Error calculating trust score:', error);
            return 0;
        }
    }
}
