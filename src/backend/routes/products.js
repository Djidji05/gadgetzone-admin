import express from 'express';
import { Op } from 'sequelize';
import { Product, Category } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/products
 * Récupère tous les produits
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filtrer par recherche
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtrer par catégorie
    if (category) {
      whereClause.category_id = category;
    }

    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
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
    console.error('Erreur produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

/**
 * GET /api/products/featured
 * Récupère les produits mis en avant
 */
router.get('/featured', async (req, res) => {
  try {
    // Récupérer les 8 premiers produits comme produits featured
    const featuredProducts = await Product.findAll({
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
 * GET /api/products/:id
 * Récupère un produit spécifique
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
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
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Le nom et le prix sont obligatoires' });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category_id: category_id || null,
      image_url: image_url || null
    });

    // Récupérer le produit avec sa catégorie
    const productWithCategory = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    res.status(201).json(productWithCategory);
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

/**
 * PUT /api/products/:id
 * Met à jour un produit
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      category_id: category_id !== undefined ? category_id : product.category_id,
      image_url: image_url !== undefined ? image_url : product.image_url
    });

    // Récupérer le produit mis à jour avec sa catégorie
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.destroy();

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

export default router;
