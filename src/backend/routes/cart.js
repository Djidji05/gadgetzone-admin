import { Cart, CartItem, Offer, Store, Promotion } from '../models/index.js';
import Product from '../models/Product.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

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
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'description', 'price', 'image_url', 'images']
          },
          {
            model: Offer,
            include: [{ model: Store, attributes: ['id', 'name'] }]
          }
        ]
      }]
    });

    // Si le panier n'existe pas, en créer un vide
    if (!cart) {
      cart = await Cart.create({ customerId });
    }

    // Calculer le total
    const totalAmount = cart.CartItems ? cart.CartItems.reduce((total, item) => {
      return total + Number(item.subtotal || (item.quantity * item.Product.price));
    }, 0) : 0;

    const response = {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.CartItems ? cart.CartItems.map(item => {
        const img = item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null);
        console.log(`[CartDebug] Product ${item.Product.id} - name: ${item.Product.name} - description: ${item.Product.description}`);
        return {
          id: item.id,
          productId: item.productId,
          offerId: item.offerId,
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          unitPrice: Number(item.unitPrice),
          metadata: item.metadata,
          offer: item.Offer,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            description: item.Product.description,
            price: item.Product.price,
            image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
          }
        };
      }) : [],
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
    const { productId, offerId, quantity = 1, metadata = null } = req.body;

    // Vérifier que le produit existe
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Déterminer le prix (Offre, variante ou de base)
    let unitPrice = product.price;

    if (offerId) {
      const offer = await Offer.findByPk(offerId);
      if (!offer || offer.productId !== productId) {
        return res.status(404).json({ message: 'Offre non trouvée pour ce produit' });
      }
      unitPrice = offer.price;
    } else if (metadata && metadata.variant && metadata.variant.price) {
      unitPrice = metadata.variant.price;
    }

    // Récupérer ou créer le panier
    let cart = await Cart.findOne({ where: { customerId } });
    if (!cart) {
      cart = await Cart.create({ customerId });
    }

    // Vérifier si le produit avec la MÊME variante est déjà dans le panier
    // Note: Pour une comparaison JSON stricte en SQL c'est complexe, 
    // on va filtrer les résultats du produit en JS pour la précision.
    let cartItems = await CartItem.findAll({
      where: { cartId: cart.id, productId, offerId: offerId || null }
    });

    let cartItem = cartItems.find(item => {
      const itemMeta = item.metadata || {};
      const targetMeta = metadata || {};
      return JSON.stringify(itemMeta) === JSON.stringify(targetMeta);
    });

    if (cartItem) {
      // Mettre à jour la quantité et le sous-total
      const newQuantity = cartItem.quantity + quantity;
      cartItem.quantity = newQuantity;
      cartItem.subtotal = newQuantity * unitPrice;
      cartItem.unitPrice = unitPrice;
      await cartItem.save();
    } else {
      // Ajouter le produit au panier
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        offerId: offerId || null,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        metadata
      });
    }

    // Retourner le panier mis à jour
    const updatedCart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'images']
        }]
      }]
    });

    const totalAmount = updatedCart.CartItems.reduce((total, item) => {
      return total + Number(item.subtotal || (item.quantity * item.Product.price));
    }, 0);

    const response = {
      id: updatedCart.id,
      customerId: updatedCart.customerId,
      items: updatedCart.CartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: Number(item.subtotal || (item.quantity * item.Product.price)),
        unitPrice: Number(item.unitPrice || item.Product.price),
        metadata: item.metadata,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          description: item.Product.description,
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


    cartItem.quantity = quantity;
    cartItem.subtotal = quantity * Number(cartItem.unitPrice || cartItem.Product.price);
    await cartItem.save();

    // Retourner le panier mis à jour
    const cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'images']
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
          description: item.Product.description,
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
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'images']
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
          description: item.Product.description,
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

    if (!code) {
      return res.status(400).json({ message: 'Code promo requis' });
    }

    // Trouver la promotion active par son code
    const promotion = await Promotion.findOne({
      where: {
        code,
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      }
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Code promo invalide ou expiré' });
    }

    // Récupérer le panier
    const cart = await Cart.findOne({
      where: { customerId },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'images']
        }]
      }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    // Calculer le total actuel
    const subtotal = cart.CartItems.reduce((total, item) => {
      return total + (item.quantity * item.Product.price);
    }, 0);

    // Vérifier le montant minimum
    if (promotion.minAmount && subtotal < promotion.minAmount) {
      return res.status(400).json({
        message: `Ce code nécessite un montant minimum de ${promotion.minAmount} HTG`
      });
    }

    // Calculer la remise
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (subtotal * Number(promotion.discount)) / 100;
    } else {
      discountAmount = Number(promotion.discount);
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

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
          description: item.Product.description,
          price: item.Product.price,
          image: item.Product.image_url || (item.Product.images && item.Product.images.length > 0 ? item.Product.images[0] : null)
        }
      })),
      promoInfo: {
        code: promotion.code,
        discount: Number(promotion.discount),
        discountType: promotion.discountType,
        discountAmount
      },
      subtotal,
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
