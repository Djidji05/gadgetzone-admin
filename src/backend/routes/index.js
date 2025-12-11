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
import brandRoutes from './brands.js';
import financeRoutes from './finance.js';
import newsletterRoutes from './newsletter.js';
import campaignRoutes from './campaigns.js';
import pageRoutes from './pages.js';
import blogRoutes from './blog.js';
import roleRoutes from './roles.js';
import notificationRoutes from './notifications.js';

const router = express.Router();

// Routes principales
router.use('/auth', authRoutes);
router.use('/paiements', paiementsRoutes);
router.use('/stats', statsSimpleRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/promotions', promotionRoutes);
router.use('/clients', clientRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/finance', financeRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/pages', pageRoutes);
router.use('/blog', blogRoutes);
router.use('/roles', roleRoutes);
router.use('/notifications', notificationRoutes);
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
