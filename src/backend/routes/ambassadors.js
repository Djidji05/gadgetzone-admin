import express from 'express';
import ambassadorController from '../controllers/AmbassadorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/ambassadors/apply
 */
router.post('/apply', authenticateToken, ambassadorController.apply);

/**
 * GET /api/ambassadors/stats
 */
router.get('/stats', authenticateToken, ambassadorController.getStats);

export default router;
