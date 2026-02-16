import express from 'express';
import { Banner, HomepageConfig, Product, Store } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const router = express.Router();

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
                // Fetch discounted active products
                const products = await Product.findAll({
                    where: {
                        original_price: { [Op.gt]: sequelize.col('price') },
                        status: 'active'
                    },
                    limit: 40,
                    order: [['updated_at', 'DESC']]
                });

                // Generate Grid Cards
                const autoCards = [];
                let currentItems = [];

                products.forEach(p => {
                    currentItems.push({
                        name: p.name,
                        image: p.image_url,
                        link: `/products/${p.id}`,
                        price: p.price,
                        originalPrice: p.original_price
                    });

                    if (currentItems.length === 4) {
                        autoCards.push({
                            id: `auto-deal-${autoCards.length}`,
                            type: 'grid',
                            title: 'Réductions du moment',
                            items: currentItems
                        });
                        currentItems = [];
                    }
                });

                // Handle remaining items (if any, creating a partial card)
                if (currentItems.length > 0) {
                    autoCards.push({
                        id: `auto-deal-${autoCards.length}`,
                        type: 'grid',
                        title: 'Dernières offres',
                        items: currentItems
                    });
                }

                // Combine with manual items (if exists in content)
                // We use 'manualItems' to store manual cards in auto mode
                const manualItems = config.content.manualItems || [];

                // Return computed config with combined items
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
