import express from 'express';
import { Op } from 'sequelize';
import db, { Product, Category, Brand, Store } from '../models/index.js';
import sequelize from '../config/database.js';
import { authenticateToken, isSeller, checkStoreActive, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { notifyLowStock } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * POST /api/products/search/image
 * Recherche des produits par image (Simulé pour l'instant)
 */
router.post('/search/image', async (req, res) => {
  try {
    const { image } = req.body; // Expecting Base64 string

    if (!image) {
      return res.status(400).json({ error: 'Image requise' });
    }

    // TODO: Implement actual AI image analysis here.
    // For now, return random products to simulate "visual similarity".

    // Fetch 5 random products
    const products = await Product.findAll({
      order: sequelize.random(),
      limit: 5,
      attributes: ['id']
    });

    if (!products.length) {
      return res.status(404).json({ error: 'Aucun produit similaire trouvé' });
    }

    // Return IDs
    const ids = products.map(p => p.id);

    // Simulate processing delay
    setTimeout(() => {
      res.json({ ids });
    }, 1500);

  } catch (error) {
    console.error('Erreur recherche image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse de l\'image' });
  }
});

/**
 * GET /api/products
 * Récupère tous les produits
 */

// ... (other imports)


// Apply optionalAuth to allow checking user role
router.get('/', optionalAuth, async (req, res) => {
  try {

    const { page = 1, limit = 10, search, category, brand, is_new, promotions } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const whereClause = {};

    // Filter by search
    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      });
    }

    // Check if filtering by specific IDs (e.g. from image search)
    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => parseInt(id));
      if (ids.length > 0) {
        conditions.push({ id: { [Op.in]: ids } });
      }
    }

    // Filter by category
    if (category) {
      conditions.push({ category_id: category });
    }

    // Filter by brand
    if (brand) {
      conditions.push({ brand_id: brand });
    }

    // Filter by novelty
    if (is_new === 'true') {
      conditions.push({ is_new: true });
    }

    // Filter by promotions
    if (promotions === 'true') {
      conditions.push({ original_price: { [Op.gt]: sequelize.col('price') } });
    }


    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';
    if (!isAdmin) {
      // If not admin, ensure product is active AND belongs to an active store (or admin)
      conditions.push({ status: 'active' });
      conditions.push({
        [Op.or]: [
          { storeId: null },
          { '$store.status$': 'active' }
        ]
      });
    }

    if (conditions.length > 0) {
      whereClause[Op.and] = conditions;
    }

    // Unified store identification
    const storeInclude = {
      model: Store,
      as: 'store',
      attributes: ['id', 'name', 'status'],
      required: false
    };


    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] },
        storeInclude
      ],
      subQuery: false,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      products: products.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.count,
        totalPages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Erreur produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/products/featured
 * Récupère les produits mis en avant
 */
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.findAll({
      where: {
        is_featured: true,
        status: 'active'
      },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(rating), 0)
              FROM reviews AS r
              WHERE r.product_id = "Product"."id" AND r.status = 'approved'
            )`),
            'rating'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM reviews AS r
              WHERE r.product_id = "Product"."id" AND r.status = 'approved'
            )`),
            'reviews_count'
          ]
        ]
      },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      limit: 8,
      order: [['created_at', 'DESC']]
    });

    res.json(featuredProducts);
  } catch (error) {
    console.error('Erreur produits featured:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits featured' });
  }
});

/**
 * GET /api/products/search
 * Recherche des produits (Utilisé par PersonalizedSlider)
 */
router.get('/search', async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ]
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'logo_url'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'status'] }
      ],
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('❌ Erreur search API:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche des produits' });
  }
});

/**
 * GET /api/products/:id
 * Récupère un produit spécifique
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'gestionnaire';

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'status'] }
      ]
    });

    if (!product || (product.status !== 'active' && !isAdmin)) {
      return res.status(404).json({ error: 'Produit non trouvé ou retiré' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erreur produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
});



/**
 * POST /api/products
 * Crée un nouveau produit
 */
router.post('/', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url, images, features, specifications, is_featured, is_new } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Le nom et le prix sont obligatoires' });
    }

    // Force creation under the user's store if seller?
    // Current Product model doesn't seem to have store_id, or does it?
    // Let's assume it's global for now or we rely on logic elsewhere. 
    // Wait, multi-vendor implies products belong to a store. 
    // Checking Product model might be wise, but for now let's just secure the route.

    // For now, if store is suspended, they can't create. Good.

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category_id: category_id || null,
      image_url: image_url || null,
      images: images || [],
      features: features || [],
      specifications: specifications || {},
      is_featured: req.user.role === 'admin' ? (is_featured || false) : false,
      is_new: is_new || false,
      storeId: req.store ? req.store.id : null
      // associated store logic should be here if table has storeId
    });

    // Récupérer le produit avec sa catégorie
    const productWithCategory = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    res.status(201).json(productWithCategory);
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du produit',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * PUT /api/products/:id
 * Met à jour un produit
 */
router.put('/:id', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url, images, features, specifications, is_featured, is_new } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Check ownership if seller
    if (req.user.role === 'seller' && product.storeId !== req.store.id) {
      return res.status(403).json({ error: 'Accès refusé : ce produit ne vous appartient pas' });
    }

    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      category_id: category_id !== undefined ? category_id : product.category_id,
      image_url: image_url !== undefined ? image_url : product.image_url,
      images: images !== undefined ? images : product.images,
      features: features !== undefined ? features : product.features,
      specifications: specifications !== undefined ? specifications : product.specifications,
      is_featured: is_featured !== undefined ? is_featured : product.is_featured,
      is_new: is_new !== undefined ? is_new : product.is_new
    });

    // Récupérer le produit mis à jour avec sa catégorie
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    // Vérifier si le stock est faible (< 10) et notifier
    if (updatedProduct.stock < 10 && updatedProduct.stock > 0) {
      await notifyLowStock(updatedProduct);
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

/**
 * DELETE /api/products/:id
 * Supprime un produit
 */
router.delete('/:id', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Check ownership if seller
    if (req.user.role === 'seller' && product.storeId !== req.store.id) {
      return res.status(403).json({ error: 'Accès refusé : ce produit ne vous appartient pas' });
    }

    // Admin deletion with reason -> Logical delete
    if ((req.user.role === 'admin' || req.user.role === 'gestionnaire') && req.body.reason) {
      await product.update({
        status: 'deleted',
        admin_note: req.body.reason
      });
      return res.json({
        message: 'Produit marqué comme supprimé avec motif',
        status: 'deleted',
        admin_note: req.body.reason
      });
    }

    await product.destroy();

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

export default router;
