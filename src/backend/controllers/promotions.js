import { Promotion, Store } from '../models/index.js';
import { logError } from '../middleware/logging.js';

export const promotionsController = {
    // Obtenir les promotions d'un vendeur
    getMyPromotions: async (req, res) => {
        try {
            const store = await Store.findOne({ where: { userId: req.user.id } });
            if (!store) {
                return res.status(404).json({ error: 'Boutique non trouvée' });
            }

            const promotions = await Promotion.findAll({
                where: { storeId: store.id },
                order: [['createdAt', 'DESC']]
            });

            res.json(promotions);
        } catch (error) {
            logError(error, req, { type: 'Get My Promotions Error' });
            res.status(500).json({ error: 'Erreur lors de la récupération des promotions' });
        }
    },

    // Créer une promotion
    createPromotion: async (req, res) => {
        try {
            const store = await Store.findOne({ where: { userId: req.user.id } });
            if (!store) {
                return res.status(404).json({ error: 'Boutique non trouvée' });
            }

            const { title, description, code, discount, discountType, minAmount, startDate, endDate, applicableProducts, usageLimit } = req.body;

            const promotion = await Promotion.create({
                storeId: store.id,
                title,
                description,
                code: code ? code.toUpperCase() : null,
                discount,
                discountType,
                minAmount,
                startDate,
                endDate,
                applicableProducts,
                usageLimit
            });

            res.status(201).json(promotion);
        } catch (error) {
            logError(error, req, { type: 'Create Promotion Error' });
            res.status(500).json({ error: 'Erreur lors de la création de la promotion' });
        }
    },

    // Mettre à jour une promotion
    updatePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const store = await Store.findOne({ where: { userId: req.user.id } });

            const promotion = await Promotion.findOne({ where: { id, storeId: store.id } });
            if (!promotion) {
                return res.status(404).json({ error: 'Promotion non trouvée' });
            }

            await promotion.update(req.body);

            res.json(promotion);
        } catch (error) {
            logError(error, req, { type: 'Update Promotion Error' });
            res.status(500).json({ error: 'Erreur lors de la mise à jour de la promotion' });
        }
    },

    // Supprimer une promotion
    deletePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const store = await Store.findOne({ where: { userId: req.user.id } });

            const promotion = await Promotion.findOne({ where: { id, storeId: store.id } });
            if (!promotion) {
                return res.status(404).json({ error: 'Promotion non trouvée' });
            }

            await promotion.destroy();

            res.json({ message: 'Promotion supprimée avec succès' });
        } catch (error) {
            logError(error, req, { type: 'Delete Promotion Error' });
            res.status(500).json({ error: 'Erreur lors de la suppression de la promotion' });
        }
    }
};
