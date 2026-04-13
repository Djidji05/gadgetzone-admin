import express from 'express';
import reviewController from '../controllers/ReviewController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/reviews/product/:productId
 */
router.get('/product/:productId', reviewController.getByProduct);

/**
 * POST /api/reviews
 */
router.post('/', authenticateToken, reviewController.create);

/**
 * DELETE /api/reviews/:id
 */
router.delete('/:id', authenticateToken, reviewController.delete);

/**
 * GET /api/reviews/pending
 */
router.get('/pending', authenticateToken, requireAdmin, reviewController.getPending);

/**
 * PATCH /api/reviews/:id/status
 */
router.patch('/:id/status', authenticateToken, requireAdmin, reviewController.moderate);

export default router;
