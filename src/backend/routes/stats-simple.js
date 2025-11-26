import express from 'express';

const router = express.Router();

/**
 * GET /api/stats/overview
 * Statistiques générales simplifiées
 */
router.get('/overview', async (req, res) => {
  try {
    const period = req.query.period || '30j';
    
    // Statistiques simulées pour l'instant
    const stats = {
      period,
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      newUsers: 0,
      averageOrderValue: 0
    };
    
    console.log('📊 Stats overview - Period:', period, 'Stats:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error in stats overview:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * GET /api/stats/top-products
 * Produits les plus vendus (vide pour l'instant)
 */
router.get('/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log('📊 Top products - Limit:', limit);
    
    // Tableau vide pour l'instant
    res.json([]);
    
  } catch (error) {
    console.error('❌ Error in top products:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits populaires' });
  }
});

/**
 * GET /api/stats/top-clients
 * Meilleurs clients (vide pour l'instant)
 */
router.get('/top-clients', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log('📊 Top clients - Limit:', limit);
    
    // Tableau vide pour l'instant
    res.json([]);
    
  } catch (error) {
    console.error('❌ Error in top clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

/**
 * GET /api/stats/traffic-sources
 * Sources de trafic (données simulées)
 */
router.get('/traffic-sources', async (req, res) => {
  try {
    const trafficSources = [
      { source: 'Recherche organique', visits: 1245, percentage: 35.2 },
      { source: 'Direct', visits: 892, percentage: 25.3 },
      { source: 'Réseaux sociaux', visits: 678, percentage: 19.2 },
      { source: 'Email marketing', visits: 445, percentage: 12.6 },
      { source: 'Publicité payante', visits: 267, percentage: 7.7 }
    ];
    
    res.json(trafficSources);
  } catch (error) {
    console.error('❌ Error in traffic sources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sources de trafic' });
  }
});

/**
 * GET /api/stats/conversion-rate
 * Taux de conversion (données simulées)
 */
router.get('/conversion-rate', async (req, res) => {
  try {
    const period = req.query.period || '30j';
    
    const conversionData = {
      period,
      current: 3.2,
      evolution: 0.8,
      data: [
        { date: '2024-01-01', rate: 2.8 },
        { date: '2024-01-02', rate: 3.1 },
        { date: '2024-01-03', rate: 3.0 },
        { date: '2024-01-04', rate: 3.4 },
        { date: '2024-01-05', rate: 3.2 }
      ]
    };
    
    res.json(conversionData);
  } catch (error) {
    console.error('❌ Error in conversion rate:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du taux de conversion' });
  }
});

export default router;
