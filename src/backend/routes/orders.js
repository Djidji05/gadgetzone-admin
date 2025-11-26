import express from 'express';
import { Op } from 'sequelize';
import { Order, OrderItem, Product, User } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/orders
 * Récupère toutes les commandes
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filtrer par statut si fourni
    if (status) {
      whereClause.status = status;
    }
    
    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      orders: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.count,
        totalPages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

/**
 * GET /api/orders/:id
 * Récupère une commande spécifique
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Erreur commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

/**
 * POST /api/orders
 * Crée une nouvelle commande
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, items, shipping_address } = req.body;
    
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'L\'utilisateur et les articles sont obligatoires' });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Calculer le montant total et vérifier les stocks
    let total_amount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res.status(404).json({ error: `Produit ${item.product_id} non trouvé` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour le produit ${product.name}` });
      }
      
      const itemTotal = product.price * item.quantity;
      total_amount += itemTotal;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // Créer la commande
    const newOrder = await Order.create({
      user_id,
      total_amount,
      status: 'pending',
      shipping_address
    });
    
    // Créer les articles de commande
    for (const itemData of orderItems) {
      await OrderItem.create({
        order_id: newOrder.id,
        ...itemData
      });
      
      // Mettre à jour le stock
      await Product.decrement('stock', {
        where: { id: itemData.product_id },
        by: itemData.quantity
      });
    }
    
    // Récupérer la commande complète
    const order = await Order.findByPk(newOrder.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ]
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

/**
 * PUT /api/orders/:id
 * Met à jour une commande
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shipping_address } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (shipping_address) updateData.shipping_address = shipping_address;
    
    await order.update(updateData);
    
    // Récupérer la commande mise à jour
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
  }
});

/**
 * DELETE /api/orders/:id
 * Supprime une commande
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    // Restaurer les stocks
    for (const item of order.items) {
      await Product.increment('stock', {
        where: { id: item.product_id },
        by: item.quantity
      });
    }
    
    // Supprimer la commande (les OrderItem seront supprimés en cascade)
    await order.destroy();
    
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression commande:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
  }
});

export default router;
