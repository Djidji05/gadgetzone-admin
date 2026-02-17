import express from 'express';
import { promotionsController } from '../controllers/promotions.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes ici nécessitent une authentification
router.use(authenticateToken);

/**
 * @swagger
 * /api/vendors/promotions:
 *   get:
 *     summary: Récupérer les promotions du vendeur connecté
 *     tags: [Promotions]
 */
router.get('/', promotionsController.getMyPromotions);

/**
 * @swagger
 * /api/vendors/promotions:
 *   post:
 *     summary: Créer une nouvelle promotion
 *     tags: [Promotions]
 */
router.post('/', promotionsController.createPromotion);

/**
 * @swagger
 * /api/vendors/promotions/{id}:
 *   put:
 *     summary: Mettre à jour une promotion
 *     tags: [Promotions]
 */
router.put('/:id', promotionsController.updatePromotion);

/**
 * @swagger
 * /api/vendors/promotions/{id}:
 *   delete:
 *     summary: Supprimer une promotion
 *     tags: [Promotions]
 */
router.delete('/:id', promotionsController.deletePromotion);

export default router;
