import express from 'express';
import offerController from '../controllers/OfferController.js';
import { authenticateToken, isSeller, checkStoreActive } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, isSeller, checkStoreActive, offerController.createOffer);
router.get('/product/:productId', offerController.getOffersByProduct);

export default router;
