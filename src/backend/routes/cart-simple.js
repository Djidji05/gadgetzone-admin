import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Product } from '../models/index.js';

const router = express.Router();

// Stockage temporaire en mémoire (pour test)
const tempCarts = new Map(); // sessionId -> cart data

// Helper pour obtenir ou créer un panier
const getOrCreateCart = (identifier) => {
  let cart = tempCarts.get(identifier);
  if (!cart) {
    cart = {
      id: Date.now(),
      customerId: identifier, // Utilisé comme ID unique
      items: [],
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tempCarts.set(identifier, cart);
  }
  return cart;
};

// Obtenir le panier (publique)
router.get('/', async (req, res) => {
  try {
    // Utiliser un identifiant de session ou IP
    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = getOrCreateCart(identifier);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du panier' });
  }
});

// Ajouter un produit au panier (publique)
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Vérifier que le produit existe
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Utiliser un identifiant de session ou IP
    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = getOrCreateCart(identifier);

    // Vérifier si le produit est déjà dans le panier
    let cartItem = cart.items.find(item => item.productId === productId);

    if (cartItem) {
      // Mettre à jour la quantité
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Stock insuffisant pour cette quantité' });
      }
      cartItem.quantity = newQuantity;
      cartItem.subtotal = newQuantity * product.price;
    } else {
      // Ajouter le produit au panier
      cartItem = {
        id: Date.now(),
        productId,
        quantity,
        unitPrice: product.price,
        subtotal: quantity * product.price,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null)
        }
      };
      cart.items.push(cartItem);
    }

    // Recalculer le total
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.updatedAt = new Date().toISOString();

    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout au panier' });
  }
});

// Mettre à jour la quantité d'un article (publique)
router.put('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à 0' });
    }

    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = getOrCreateCart(identifier);

    const cartItem = cart.items.find(item => item.id === parseInt(itemId));
    if (!cartItem) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Vérifier le stock
    const product = await Product.findByPk(cartItem.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    cartItem.quantity = quantity;
    cartItem.subtotal = quantity * product.price;

    // Recalculer le total
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.updatedAt = new Date().toISOString();

    res.json(cart);
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la quantité' });
  }
});

// Supprimer un article du panier (publique)
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = getOrCreateCart(identifier);

    const itemIndex = cart.items.findIndex(item => item.id === parseInt(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculer le total
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.updatedAt = new Date().toISOString();

    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'article' });
  }
});

// Vider le panier (publique)
router.delete('/clear', async (req, res) => {
  try {
    const identifier = req.ip || req.sessionID || 'anonymous';
    tempCarts.delete(identifier);

    res.json({ message: 'Panier vidé avec succès' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Erreur lors du vidage du panier' });
  }
});

// Appliquer un code promo (publique)
router.post('/promo', async (req, res) => {
  try {
    const { code } = req.body;

    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = getOrCreateCart(identifier);

    // Pour l'instant, retourner le panier sans promo
    // TODO: Implémenter la logique des codes promo
    console.log(`Code promo reçu: ${code} (non implémenté)`);

    res.json(cart);
  } catch (error) {
    console.error('Apply promo error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'application du code promo' });
  }
});

// === ROUTES PROTÉGÉES (nécessitent authentification) ===

// Convertir le panier en commande (nécessite authentification)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { shippingInfo, paymentInfo } = req.body;

    // Récupérer le panier anonyme et le convertir
    const identifier = req.ip || req.sessionID || 'anonymous';
    const cart = tempCarts.get(identifier);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    // TODO: Créer la commande dans la base de données avec les infos client
    console.log(`Checkout pour client ${customerId}:`, {
      items: cart.items.length,
      total: cart.totalAmount,
      shipping: shippingInfo,
      payment: paymentInfo
    });

    // TODO: Vider le panier après conversion

    res.json({
      message: 'Commande créée avec succès',
      orderId: Date.now(),
      customerId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingInfo,
      paymentInfo
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Erreur lors de la finalisation de la commande' });
  }
});

export default router;
