import express from 'express';
import productController from '../controllers/ProductController.js';
import { authenticateToken, isSeller, checkStoreActive, optionalAuth } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/products/search
 * Search products with Meilisearch or traditional fallback
 */
router.get('/search', productController.searchProducts);

/**
 * GET /api/products/new
 * Fetch new arrivals
 */
router.get('/new', productController.getNewProducts);

/**
 * GET /api/products
 * Fetch all products with filtering and pagination
 */
router.get('/', optionalAuth, productController.getAllProducts);

/**
 * GET /api/products/featured
 * Fetch featured products
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * GET /api/products/:id
 * Fetch a specific product
 */
router.get('/:id', optionalAuth, productController.getProductById);

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', authenticateToken, isSeller, checkStoreActive, validateProduct, productController.createProduct);

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', authenticateToken, isSeller, checkStoreActive, validateProduct, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', authenticateToken, isSeller, checkStoreActive, productController.deleteProduct);

export default router;
