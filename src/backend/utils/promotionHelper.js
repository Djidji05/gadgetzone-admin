import { Promotion } from '../models/index.js';
import { Op } from 'sequelize';

let cachedPromos = null;
let lastPromoFetch = 0;
const PROMO_CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Applique les promotions actives à une liste de produits.
 * @param {Array} products - Liste des produits (Sequelize instances ou objets simples)
 * @returns {Promise<Array>} - Liste des produits avec prix mis à jour
 */
export const applyPromotionsToProducts = async (products) => {
    if (!products || products.length === 0) return products;

    try {
        // Cache pour les promotions actives (1 minute)
        if (!cachedPromos || Date.now() - lastPromoFetch > PROMO_CACHE_TTL) {
            cachedPromos = await Promotion.findAll({
                where: {
                    code: null,
                    isActive: true,
                    startDate: { [Op.lte]: new Date() },
                    endDate: { [Op.gte]: new Date() }
                },
                raw: true,
                logging: false
            });
            lastPromoFetch = Date.now();
        }

        const activePromos = cachedPromos;


        // Convertir en objets simples si nécessaire
        const productsList = products.map(p => typeof p.toJSON === 'function' ? p.toJSON() : p);

        return productsList.map(product => {
            // Trouver la promotion applicable (la plus avantageuse si plusieurs?)
            const applicablePromo = activePromos.find(promo =>
                Array.isArray(promo.applicableProducts) &&
                promo.applicableProducts.includes(product.id)
            );

            if (applicablePromo) {
                // Le prix actuel devient l'original_price s'il n'est pas déjà défini
                if (!product.original_price || product.original_price <= product.price) {
                    product.original_price = product.price;
                }

                // Calculer le nouveau prix réduit
                let discountedPrice = product.price;
                if (applicablePromo.discountType === 'percentage') {
                    discountedPrice = product.price * (1 - applicablePromo.discount / 100);
                } else {
                    discountedPrice = Math.max(0, product.price - applicablePromo.discount);
                }

                product.price = discountedPrice;
            }

            return product;
        });
    } catch (error) {
        console.error('Error applying promotions:', error);
        return products;
    }
};

/**
 * Applique les promotions actives à un seul produit.
 */
export const applyPromotionsToProduct = async (product) => {
    const results = await applyPromotionsToProducts([product]);
    return results[0];
};
