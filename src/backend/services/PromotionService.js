import promotionRepository from '../repositories/PromotionRepository.js';

class PromotionService {
    async getActiveBanners() {
        return await promotionRepository.findActiveBanners();
    }

    async getPromotions(isAdmin = false) {
        return await promotionRepository.findPromotions(isAdmin);
    }

    async createPromotion(data) {
        return await promotionRepository.create({
            ...data,
            storeId: data.storeId || 1
        });
    }

    async updatePromotion(id, data) {
        const promotion = await promotionRepository.findById(id);
        if (!promotion) {
            throw new Error('Promotion non trouvée');
        }
        return await promotionRepository.update(id, data);
    }

    async deletePromotion(id) {
        const promotion = await promotionRepository.findById(id);
        if (!promotion) {
            throw new Error('Promotion non trouvée');
        }
        return await promotionRepository.delete(id);
    }

    async validateCode(code, cartTotal) {
        if (!code) {
            throw new Error('Le code promo est obligatoire');
        }

        const promotion = await promotionRepository.findByCode(code);

        if (!promotion) {
            throw new Error('Code promo invalide ou expiré');
        }

        if (promotion.minAmount && cartTotal < promotion.minAmount) {
            throw new Error(`Le montant minimum pour ce code est de ${promotion.minAmount} G`);
        }

        let discountAmount = 0;
        if (promotion.discountType === 'percentage') {
            discountAmount = (cartTotal * promotion.discount) / 100;
        } else {
            discountAmount = parseFloat(promotion.discount);
        }

        return {
            valid: true,
            promotion,
            discountAmount,
            newTotal: cartTotal - discountAmount
        };
    }
}

export default new PromotionService();
