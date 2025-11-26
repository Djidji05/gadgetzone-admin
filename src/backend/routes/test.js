import express from 'express';

const router = express.Router();

/**
 * GET /api/test
 * Route de test pour vérifier que le backend fonctionne
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Backend Node.js is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * GET /api/test/health
 * Vérification de santé complète
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

export default router;
