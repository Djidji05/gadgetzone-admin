import express from 'express';
// import statsRoutes from './stats.js';
import statsSimpleRoutes from './stats-simple.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import promotionRoutes from './promotions.js';
import clientRoutes from './clients.js';
import orderRoutes from './orders.js';
import authRoutes from './auth.js';
import testRoutes from './test.js';
import cartRoutes from './cart-simple.js';
import paiementsRoutes from './paiements.js';

const router = express.Router();

// Routes principales
router.use('/auth', authRoutes);
router.use('/paiements', paiementsRoutes);
// router.use('/stats', statsRoutes);
router.use('/stats-simple', statsSimpleRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/promotions', promotionRoutes);
router.use('/clients', clientRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/test', testRoutes);

// Route de test
router.get('/', (req, res) => {
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
