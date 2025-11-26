import express from 'express';

const router = express.Router();

// Données de démonstration pour les bannières
const mockBanners = [
  {
    id: 1,
    title: 'Bienvenue sur GadgetZone',
    subtitle: 'Découvrez nos derniers produits technologiques',
    image: 'https://via.placeholder.com/1200x500/3B82F6/FFFFFF?text=Bannière+GadgetZone',
    link: '/products',
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2025-12-31'
  },
  {
    id: 2,
    title: 'Promotions Spéciales',
    subtitle: '-20% sur tous les produits sélectionnés',
    image: 'https://via.placeholder.com/1200x500/10B981/FFFFFF?text=Promotions+-20%25',
    link: '/products?promotion=special',
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2025-12-31'
  }
];

// Données de démonstration pour les promotions
const mockPromotions = [
  {
    id: 1,
    title: 'Été 2024',
    description: "Profitez de nos offres spéciales pour l'été",
    code: 'ETE2024',
    discount: 15,
    discountType: 'percentage',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    isActive: true,
    image: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Été+2024',
    applicableProducts: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    title: 'Black Friday',
    description: "Les meilleures offres de l'année",
    code: 'BLACK2024',
    discount: 30,
    discountType: 'percentage',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    isActive: true,
    image: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Black+Friday',
    applicableProducts: [1, 3, 5, 7, 8]
  }
];

/**
 * GET /api/promotions/banners
 * Récupère les bannières actives
 */
router.get('/banners', async (req, res) => {
  try {
    const activeBanners = mockBanners.filter(banner =>
      banner.isActive &&
      new Date() >= new Date(banner.startDate) &&
      new Date() <= new Date(banner.endDate)
    );

    res.json(activeBanners);
  } catch (error) {
    console.error('Erreur bannières:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des bannières' });
  }
});

/**
 * GET /api/promotions
 * Récupère les promotions actives
 */
router.get('/', async (req, res) => {
  try {
    const activePromotions = mockPromotions.filter(promotion =>
      promotion.isActive &&
      new Date() >= new Date(promotion.startDate) &&
      new Date() <= new Date(promotion.endDate)
    );

    res.json(activePromotions);
  } catch (error) {
    console.error('Erreur promotions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des promotions' });
  }
});

/**
 * POST /api/promotions/validate
 * Valide un code promo
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Le code promo est obligatoire' });
    }

    const promotion = mockPromotions.find(promo =>
      promo.code === code.toUpperCase() &&
      promo.isActive &&
      new Date() >= new Date(promo.startDate) &&
      new Date() <= new Date(promo.endDate)
    );

    if (!promotion) {
      return res.status(404).json({ error: 'Code promo invalide ou expiré' });
    }

    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (cartTotal * promotion.discount) / 100;
    } else {
      discountAmount = promotion.discount;
    }

    res.json({
      valid: true,
      promotion,
      discountAmount,
      newTotal: cartTotal - discountAmount
    });
  } catch (error) {
    console.error('Erreur validation promo:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du code promo' });
  }
});

export default router;
