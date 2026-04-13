import express from 'express';
import { getSEOSettings, updateSEOSettings, getSystemHealth, runMaintenance } from '../controllers/SEOController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes SEO/Health sont réservées aux admins
router.use(authenticateToken, requireAdmin);

router.get('/settings', getSEOSettings);
router.post('/settings', updateSEOSettings);
router.get('/health-stats', getSystemHealth);
router.post('/maintenance', runMaintenance);

export default router;
