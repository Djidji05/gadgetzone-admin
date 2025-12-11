import express from 'express';
import { Cart, CartItem } from '../models/index.js';
import Product from '../models/Product.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Route de debug TEMPORAIRE (à retirer ensuite) - Doit être AVANT le middleware d'auth
router.post('/debug_test', async (req, res) => {
  try {
    const { Cart, CartItem } = await import('../models/index.js');
    const Product = (await import('../models/Product.js')).default;

    const carts = await Cart.findAll({
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images']
        }]
      }],
      limit: 1
    });

    const debugInfo = carts.map(c => ({
      cartId: c.id,
      items: c.CartItems.map(i => ({
        prodId: i.Product.id,
        url: i.Product.image_url,
        images: i.Product.images,
        logic: i.Product.image_url || (i.Product.images && i.Product.images.length > 0 ? i.Product.images[0] : 'FAIL')
      }))
    }));

    res.json({
      db_config: Cart.sequelize.config.database,
      carts: debugInfo
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Middleware d'authentification pour toutes les routes panier
router.use(authenticateToken);

// Obtenir le panier du client connecté
router.get('/', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logFile = path.resolve('app_debug_log.txt');
    const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

    log(`Cart Request. DB Name: ${Cart.sequelize.config.database} / Host: ${Cart.sequelize.config.host}`);

    const customerId = req.user.id;

    let cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images', 'stock']
        }]
      }]
    });

    // Si le panier n'existe pas, en créer un vide
    if (!cart) {
      cart = await Cart.create({ customerId });
    }

    // Calculer le total
    const totalAmount = cart.CartItems ? cart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0) : 0;

    const response = {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.CartItems ? cart.CartItems.map(item => {
        const img = item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null);
        console.log(`[CartDebug] Product ${item.Product.id}: url=${item.Product.image_url}, images=${JSON.stringify(item.Product.images)}, result=${img}`);
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.quantity * item.Product.price,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: item.Product.price,
            image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
          }
        })) : [],
          totalAmount,
          createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
    };

res.json(response);
  } catch (error) {
  console.error('Get cart error:', error);
  res.status(500).json({ message: 'Erreur lors de la récupération du panier' });
}
});

// Ajouter un produit au panier
router.post('/add', async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Vérifier que le produit existe et est en stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Récupérer ou créer le panier
    let cart = await Cart.findOne({ where: { customerId } });
    if (!cart) {
      cart = await Cart.create({ customerId });
    }

    // Vérifier si le produit est déjà dans le panier
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (cartItem) {
      // Mettre à jour la quantité
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Stock insuffisant pour cette quantité' });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Ajouter le produit au panier
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity
      });
    }

    // Retourner le panier mis à jour
    const updatedCart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images', 'stock']
        }]
      }]
    });

    const totalAmount = updatedCart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0);

    const response = {
      id: updatedCart.id,
      customerId: updatedCart.customerId,
      items: updatedCart.CartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.quantity * item.Product.price,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
        }
      })),
      totalAmount,
      createdAt: updatedCart.createdAt,
      updatedAt: updatedCart.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout au panier' });
  }
});

// Mettre à jour la quantité d'un article
router.put('/items/:itemId', async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à 0' });
    }

    // Vérifier que l'article appartient au panier du client
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: Cart,
        where: { customerId }
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Vérifier le stock
    const product = await Product.findByPk(cartItem.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Retourner le panier mis à jour
    const cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images', 'stock']
        }]
      }]
    });

    const totalAmount = cart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0);

    const response = {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.CartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.quantity * item.Product.price,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
        }
      })),
      totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la quantité' });
  }
});

// Supprimer un article du panier
router.delete('/items/:itemId', async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;

    // Vérifier que l'article appartient au panier du client
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: Cart,
        where: { customerId }
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    await cartItem.destroy();

    // Retourner le panier mis à jour
    const cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images', 'stock']
        }]
      }]
    });

    const totalAmount = cart.CartItems ? cart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0) : 0;

    const response = {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.CartItems ? cart.CartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.quantity * item.Product.price,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
        }
      })) : [],
      totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'article' });
  }
});

// Vider le panier
router.delete('/clear', async (req, res) => {
  try {
    const customerId = req.user.id;

    const cart = await Cart.findOne({ where: { customerId } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    res.json({ message: 'Panier vidé avec succès' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Erreur lors du vidage du panier' });
  }
});

// Appliquer un code promo
router.post('/promo', async (req, res) => {
  try {
    const customerId = req.user.id;
    const { code } = req.body;

    // Pour l'instant, retourner le panier sans promo
    // TODO: Implémenter la logique des codes promo
    const cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url', 'images', 'stock']
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const totalAmount = cart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0);

    const response = {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.CartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.quantity * item.Product.price,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
        }
      })),
      totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Apply promo error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'application du code promo' });
  }
});

export default router;
