import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import deliveryController from '../controllers/DeliveryController.js';

const router = express.Router();

// Toutes les routes de livraison nécessitent une authentification
router.use(authenticateToken);

/**
 * POST /api/delivery/verify-scan
 * Valider une livraison via le code QR/Jeton du client.
 * Réservé aux Vendeurs (propriétaires) ou Admins.
 */
router.post('/verify-scan', deliveryController.verifyScan);

export default router;
