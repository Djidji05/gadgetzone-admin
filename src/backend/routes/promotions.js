import express from 'express';
import promotionController from '../controllers/PromotionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/promotions/banners
 */
router.get('/banners', promotionController.getBanners);

/**
 * GET /api/promotions
 */
router.get('/', promotionController.getAll);

/**
 * POST /api/promotions
 */
router.post('/', authenticateToken, requireAdmin, promotionController.create);

/**
 * PUT /api/promotions/:id
 */
router.put('/:id', authenticateToken, requireAdmin, promotionController.update);

/**
 * DELETE /api/promotions/:id
 */
router.delete('/:id', authenticateToken, requireAdmin, promotionController.delete);

/**
 * POST /api/promotions/validate
 */
router.post('/validate', promotionController.validate);

export default router;
