import promotionService from '../services/PromotionService.js';
import { apiLogger } from '../utils/logger.js';

class PromotionController {
    async getBanners(req, res) {
        try {
            const banners = await promotionService.getActiveBanners();
            res.json(banners);
        } catch (error) {
            apiLogger.error('Get Banners Error', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des bannières' });
        }
    }

    async getAll(req, res) {
        try {
            const isAdmin = req.query.admin === 'true';
            const promotions = await promotionService.getPromotions(isAdmin);
            res.json(promotions);
        } catch (error) {
            apiLogger.error('Get Promotions Error', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des promotions' });
        }
    }

    async create(req, res) {
        try {
            const promotion = await promotionService.createPromotion(req.body);
            res.status(201).json(promotion);
        } catch (error) {
            apiLogger.error('Create Promotion Error', error);
            res.status(500).json({ error: 'Erreur lors de la création de la promotion' });
        }
    }

    async update(req, res) {
        try {
            const promotion = await promotionService.updatePromotion(req.params.id, req.body);
            res.json(promotion);
        } catch (error) {
            apiLogger.error('Update Promotion Error', error);
            const status = error.message === 'Promotion non trouvée' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await promotionService.deletePromotion(req.params.id);
            res.json({ message: 'Promotion supprimée avec succès' });
        } catch (error) {
            apiLogger.error('Delete Promotion Error', error);
            const status = error.message === 'Promotion non trouvée' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async validate(req, res) {
        try {
            const result = await promotionService.validateCode(req.body.code, req.body.cartTotal);
            res.json(result);
        } catch (error) {
            apiLogger.error('Validate Code Error', error);
            const status = error.message === 'Code promo invalide ou expiré' ? 404 : 400;
            res.status(status).json({ error: error.message });
        }
    }
}

export default new PromotionController();
