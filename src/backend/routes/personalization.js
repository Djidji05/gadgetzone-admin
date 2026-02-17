import express from 'express';
import { Banner, HomepageConfig, Product, Store, Promotion } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const router = express.Router();

const formatPrice = (price) => {
    return `${Math.round(price)} G`;
};

// --- Banners ---

// Get all banners
router.get('/banners', async (req, res) => {
    try {
        const banners = await Banner.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des bannières' });
    }
});

// Create banner
router.post('/banners', async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la bannière' });
    }
});

// Update banner
router.put('/banners/:id', async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        if (!banner) {
            return res.status(404).json({ error: 'Bannière non trouvée' });
        }
        await banner.update(req.body);
        res.json(banner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la bannière' });
    }
});

// Delete banner
router.delete('/banners/:id', async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        if (!banner) {
            return res.status(404).json({ error: 'Bannière non trouvée' });
        }
        await banner.destroy();
        res.json({ message: 'Bannière supprimée' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la bannière' });
    }
});

// --- Homepage Configurations (Sections) ---

// Get section config
router.get('/sections/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const config = await HomepageConfig.findOne({ where: { section } });

        // Default structure if not found
        if (!config) {
            return res.json({
                section,
                content: { mode: 'manual', items: [] },
                isActive: true
            });
        }

        // Logic for Deals to Discover - Automatic Mode
        if (section === 'deals_to_discover' && config.content && config.content.mode === 'automatic') {
            try {
                // 1. Fetch Active Direct Promotions (No Code)
                const activePromos = await Promotion.findAll({
                    where: {
                        code: null,
                        isActive: true,
                        startDate: { [Op.lte]: new Date() },
                        endDate: { [Op.gte]: new Date() }
                    }
                });

                // Extract all applicable product IDs
                let promoProductIds = [];
                activePromos.forEach(promo => {
                    if (Array.isArray(promo.applicableProducts)) {
                        promoProductIds = [...promoProductIds, ...promo.applicableProducts];
                    }
                });

                // 2. Fetch products with manual original_price > price OR from activePromos
                let products = await Product.findAll({
                    where: {
                        [Op.or]: [
                            { original_price: { [Op.gt]: sequelize.col('price') } },
                            { id: { [Op.in]: promoProductIds } }
                        ],
                        status: 'active'
                    },
                    limit: 40,
                    order: [['updated_at', 'DESC']]
                });

                let sectionTitle = 'Réductions du moment';

                // 2. Fallback A: Top Rated (if no discounts)
                if (products.length === 0) {
                    products = await Product.findAll({
                        where: { status: 'active' },
                        limit: 12,
                        order: [['created_at', 'DESC']] // Or rating if available, using created_at for freshness
                    });

                    // Filter for "Community Favorites" (simulated by latest high-quality additions)
                    sectionTitle = 'Pépites de la communauté';
                }

                // 3. Fallback B: Low Stock (if still empty)
                if (products.length === 0) {
                    products = await Product.findAll({
                        where: {
                            status: 'active',
                            stock: { [Op.gt]: 0, [Op.lt]: 5 }
                        },
                        limit: 12,
                        order: [['stock', 'ASC']]
                    });
                    sectionTitle = 'Dernières opportunités';
                }

                // Generate Grid Cards based on count
                const autoCards = [];

                if (products.length === 1) {
                    // Rule: 1 product uses promo grid (large card)
                    const p = products[0];
                    const promo = activePromos.find(pr => Array.isArray(pr.applicableProducts) && pr.applicableProducts.includes(p.id));

                    let displayPrice = p.price;
                    let displayOriginalPrice = p.original_price;

                    if (promo) {
                        displayOriginalPrice = p.price;
                        if (promo.discountType === 'percentage') {
                            displayPrice = p.price * (1 - promo.discount / 100);
                        } else {
                            displayPrice = Math.max(0, p.price - promo.discount);
                        }
                    }

                    autoCards.push({
                        id: `auto-promo-${p.id}`,
                        type: 'promo',
                        title: p.name,
                        subtitle: sectionTitle,
                        image: p.image_url,
                        link: `/products/${p.id}`,
                        linkText: 'Profiter de l\'offre',
                        promoText: `${formatPrice(displayPrice)}`,
                        promoTextColor: '#ffffff',
                        promoStyle: 'image'
                    });
                } else if (products.length > 1) {
                    // Rule: 2+ products use grid of 4
                    let currentItems = [];

                    products.forEach(p => {
                        const promo = activePromos.find(pr => Array.isArray(pr.applicableProducts) && pr.applicableProducts.includes(p.id));

                        let displayPrice = p.price;
                        let displayOriginalPrice = p.original_price;

                        if (promo) {
                            displayOriginalPrice = p.price;
                            if (promo.discountType === 'percentage') {
                                displayPrice = p.price * (1 - promo.discount / 100);
                            } else {
                                displayPrice = Math.max(0, p.price - promo.discount);
                            }
                        }

                        currentItems.push({
                            id: p.id,
                            name: p.name,
                            image: p.image_url,
                            link: `/products/${p.id}`,
                            price: displayPrice,
                            originalPrice: displayOriginalPrice
                        });

                        if (currentItems.length === 4) {
                            autoCards.push({
                                id: `auto-deal-${autoCards.length}`,
                                type: 'grid',
                                title: sectionTitle,
                                cols: 4,
                                items: currentItems
                            });
                            currentItems = [];
                        }
                    });

                    // Remaining items (e.g. if we have 2, they will be in a grid of 4 with 2 spaces empty)
                    if (currentItems.length > 0) {
                        autoCards.push({
                            id: `auto-deal-${autoCards.length}`,
                            type: 'grid',
                            title: sectionTitle,
                            cols: 4,
                            items: currentItems
                        });
                    }
                }

                // Combine with manual items
                const manualItems = config.content.manualItems || [];

                const computedConfig = config.toJSON();
                computedConfig.content.items = [...autoCards, ...manualItems];

                return res.json(computedConfig);

            } catch (err) {
                console.error('Error generating auto deals:', err);
                // Fallback to simpler config on error
                return res.json(config);
            }
        }

        // Logic for Weather Picks - Automatic Mode
        if (section === 'weather_picks' && config.content && config.content.mode === 'automatic') {
            try {
                const now = new Date();
                const currentMonth = now.getMonth() + 1; // 1-12

                // Determine Active Tag
                let activeTag = config.content.weatherOverride || '';

                if (!activeTag) {
                    // Auto-detect based on date
                    if (currentMonth === 12) activeTag = 'noel';
                    else if (currentMonth >= 6 && currentMonth <= 8) activeTag = 'summer';
                    else if (currentMonth === 9) activeTag = 'school';
                    else if (currentMonth >= 11 || currentMonth <= 2) activeTag = 'winter';
                }

                const allItems = config.content.items || [];

                // Filter: Context-specific + Default
                let filteredItems = allItems.filter(item => item.tag === activeTag);

                // Titles Mapping
                const titles = {
                    'noel': { title: 'Sélection Spéciale Noël', subtitle: 'Célébrez les fêtes avec nos offres festives' },
                    'rain': { title: 'Sélection Temps de Pluie', subtitle: 'Restez au sec et profitez de l\'intérieur' },
                    'storm': { title: 'Indispensables Tempête', subtitle: 'Préparez-vous aux vents forts et intempéries' },
                    'summer': { title: 'Sélection Été & Chaleur', subtitle: 'Tout pour rester au frais sous le soleil' },
                    'school': { title: 'Spécial Rentrée Scolaire', subtitle: 'Prêt pour une nouvelle année de succès' },
                    'winter': { title: 'Confort d\'Hiver', subtitle: 'Chaleur et bien-être pour la saison froide' }
                };

                const contextMeta = titles[activeTag] || { title: 'Météo & Pratique', subtitle: 'Sélections adaptées à votre quotidien' };

                // If we don't have enough specific items, add default ones (tag empty)
                if (filteredItems.length < 3 && activeTag !== '') {
                    const defaultItems = allItems.filter(item => !item.tag);
                    filteredItems = [...filteredItems, ...defaultItems].slice(0, 6);
                }

                // If still nothing and no tag, just show all default
                if (filteredItems.length === 0) {
                    filteredItems = allItems.filter(item => !item.tag).slice(0, 6);
                }

                const computedConfig = config.toJSON();
                computedConfig.content.items = filteredItems;
                computedConfig.content.title = contextMeta.title;
                computedConfig.content.subtitle = contextMeta.subtitle;
                return res.json(computedConfig);

            } catch (err) {
                console.error('Error generating auto weather picks:', err);
                return res.json(config);
            }
        }

        res.json(config);

    } catch (error) {
        console.error(`Error fetching section ${req.params.section}:`, error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
    }
});

// Update section config
router.post('/sections/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const { content, isActive } = req.body;

        let config = await HomepageConfig.findOne({ where: { section } });

        if (config) {
            await config.update({ content, isActive });
        } else {
            config = await HomepageConfig.create({ section, content, isActive });
        }

        res.json(config);
    } catch (error) {
        console.error(`Error updating section ${req.params.section}:`, error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration' });
    }
});

export default router;
