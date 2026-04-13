import express from 'express';
import paymentController from '../controllers/PaymentController.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/webhooks/moncash
 * Webhook endpoint for MonCash notifications
 * 🛡️ SÉCURITÉ: Rate limiting appliqué + Filtrage par secret dans le contrôleur
 */
router.post('/moncash', webhookLimiter, paymentController.handleMonCashWebhook);

export default router;
