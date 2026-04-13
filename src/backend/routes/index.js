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
import webhookRoutes from './webhooks.js';
import brandRoutes from './brands.js';
import financeRoutes from './finance.js';
import newsletterRoutes from './newsletter.js';
import campaignRoutes from './campaigns.js';
import pageRoutes from './pages.js';
import blogRoutes from './blog.js';
import roleRoutes from './roles.js';
import notificationRoutes from './notifications.js';
import addressRoutes from './addresses.js'; // Import Address Route
import reviewRoutes from './reviews.js';
import vendorRoutes from './vendors.js';
import vendorPromotionsRoutes from './vendors-promotions.js';
import adminVendorRoutes from './admin-vendors.js';
import adminPayoutRoutes from './admin-payouts.js';
import adminProductRoutes from './admin-products.js';
import adminBoostRoutes from './admin-boosts.js';
import uploadRoutes from './upload.js';
import personalizationRoutes from './personalization.js';
import messageRoutes from './messages.js';
import userRoutes from './users.js';
import ambassadorRoutes from './ambassadors.js';
import disputeRoutes from './disputes.js';
import refundRoutes from './refunds.js';
import ticketRoutes from './tickets.js';
import settingsRoutes from './settings.js';
import searchRoutes from './search.js';
import offerRoutes from './offers.js';
import seoRoutes from './seo.js';
import contactRoutes from './contact.js';
import academyRoutes from './academy.js';
import aiRoutes from './ai.js';
import deliveryRoutes from './delivery.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { healthCheck } from '../middleware/logging.js';

const router = express.Router();

// Route de santé (déplacée ici pour être sous /api/health)
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      ...health
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

// Routes principales
router.use('/auth', authRoutes);
router.use('/ambassadors', ambassadorRoutes);
router.use('/disputes', disputeRoutes);
router.use('/refunds', refundRoutes);
router.use('/tickets', ticketRoutes);
router.use('/paiements', paiementsRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/stats', statsSimpleRoutes);
router.use('/products', cacheMiddleware(5), productRoutes); // Cache 5 min
router.use('/categories', cacheMiddleware(60), categoryRoutes); // Cache 1 hour
router.use('/brands', cacheMiddleware(60), brandRoutes); // Cache 1 hour
router.use('/promotions', cacheMiddleware(10), promotionRoutes); // Cache 10 min
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes); // Register Address Route
router.use('/reviews', reviewRoutes); // Register Review Route
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/finance', financeRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/pages', pageRoutes);
router.use('/blog', blogRoutes);
router.use('/roles', roleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/vendors/promotions', vendorPromotionsRoutes);
router.use('/vendors', vendorRoutes);
router.use('/admin/vendors', adminVendorRoutes);
router.use('/admin/payouts', adminPayoutRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/boosts', adminBoostRoutes);
router.use('/upload', uploadRoutes);
router.use('/personalization', personalizationRoutes);
router.use('/messages', messageRoutes);
// router.use('/test', testRoutes); // Désactivé en production
router.use('/settings', settingsRoutes);
router.use('/search', searchRoutes);
router.use('/offers', offerRoutes);
router.use('/admin/seo', seoRoutes);
router.use('/contact', contactRoutes);
router.use('/academy', academyRoutes);
router.use('/ai', aiRoutes);
router.use('/delivery', deliveryRoutes);

// Route de test
router.get('/', (req, res) => {
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
