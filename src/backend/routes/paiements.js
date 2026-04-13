import express from 'express';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';
import paymentController from '../controllers/PaymentController.js';
import db, { Order, User } from '../models/index.js';

const { sequelize } = db;
const router = express.Router();

// Middleware d'authentification pour toutes les routes paiements
router.use(authenticateToken);

/**
 * POST /api/paiements/init-moncash
 * Initier un paiement MonCash
 */
router.post('/init-moncash', paymentController.initMonCash);

/**
 * GET /api/paiements/verify/:orderId
 * Vérifier manuellement un paiement (Polling)
 */
router.get('/verify/:orderId', paymentController.verifyPayment);

/**
 * GET /api/paiements/stats
 * Obtenir les statistiques des paiements (basées sur les commandes)
 */
router.get('/stats', async (req, res) => {
  // Keep existing logic for now as it's purely analytical
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const successfulStatuses = ['confirmed', 'shipped', 'delivered'];

    const totalRevenueResult = await Order.sum('total_amount', {
      where: { status: { [Op.in]: successfulStatuses } }
    });
    const totalRevenue = totalRevenueResult || 0;

    const todayOrders = await Order.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    const pendingPayments = await Order.count({
      where: { status: 'pending' }
    });

    const totalOrders = await Order.count();
    const successfulOrders = await Order.count({
      where: { status: { [Op.in]: successfulStatuses } }
    });
    const successRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : 0;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });

    const todayGrowth = yesterdayOrders > 0
      ? (((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1)
      : (todayOrders > 0 ? 100 : 0);

    const stats = {
      totalRevenue,
      revenueGrowth: 12.5,
      todayPayments: todayOrders,
      todayGrowth: Number(todayGrowth),
      successRate: Number(successRate),
      pendingPayments
    };

    res.json(stats);
  } catch (error) {
    console.error('Get payments stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * GET /api/paiements
 * Obtenir la liste des paiements
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (status) {
      if (status === 'completed') {
        whereClause.status = { [Op.in]: ['confirmed', 'shipped', 'delivered'] };
      } else if (status === 'failed') {
        whereClause.status = 'cancelled';
      } else {
        whereClause.status = status;
      }
    }

    const includeUser = {
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email']
    };

    if (search) {
      includeUser.where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [includeUser],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const payments = rows.map(order => {
      let paymentStatus = 'pending';
      if (['confirmed', 'shipped', 'delivered'].includes(order.status)) paymentStatus = 'completed';
      if (order.status === 'cancelled') paymentStatus = 'failed';

      return {
        id: order.id,
        customer: order.user ? order.user.name : 'Client Inconnu',
        email: order.user ? order.user.email : 'N/A',
        amount: parseFloat(order.total_amount),
        method: order.payment_method || 'MonCash',
        status: paymentStatus,
        date: order.created_at,
        orderId: order.id,
        transactionId: order.transaction_id || `ORD-${order.id}`
      };
    });

    res.json({
      payments,
      total: count
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

/**
 * GET /api/paiements/methods
 * Obtenir les méthodes de paiement
 */
router.get('/methods', async (req, res) => {
  try {
    const successfulStatuses = ['confirmed', 'shipped', 'delivered'];
    const totalRevenue = await Order.sum('total_amount', {
      where: { status: { [Op.in]: successfulStatuses } }
    }) || 0;

    const totalCount = await Order.count({
      where: { status: { [Op.in]: successfulStatuses } }
    });

    const methods = [
      {
        name: 'MonCash',
        count: Math.round(totalCount * 0.8),
        percentage: 80,
        amount: totalRevenue * 0.8
      },
      {
        name: 'Natcash',
        count: Math.round(totalCount * 0.1),
        percentage: 10,
        amount: totalRevenue * 0.1
      },
      {
        name: 'Carte de crédit',
        count: Math.round(totalCount * 0.1),
        percentage: 10,
        amount: totalRevenue * 0.1
      }
    ];

    res.json(methods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des méthodes de paiement' });
  }
});

/**
 * GET /api/paiements/revenue
 * Obtenir les données de revenus
 */
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30j' } = req.query;

    let days = 30;
    if (period === '7j') days = 7;
    if (period === '90j') days = 90;
    if (period === '1an') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      where: {
        created_at: { [Op.gte]: startDate },
        status: { [Op.in]: ['confirmed', 'shipped', 'delivered'] }
      },
      attributes: ['created_at', 'total_amount']
    });

    const revenueMap = new Map();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      revenueMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
    }

    orders.forEach(order => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      if (revenueMap.has(dateStr)) {
        const entry = revenueMap.get(dateStr);
        entry.revenue += parseFloat(order.total_amount);
        entry.orders += 1;
      }
    });

    const revenueData = Array.from(revenueMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données de revenus' });
  }
});

/**
 * GET /api/paiements/export
 * Exporter les paiements
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const orders = await Order.findAll({
      include: [{ model: User, as: 'user' }],
      order: [['created_at', 'DESC']]
    });

    let content = 'ID,Date,Client,Montant,Statut\n';
    orders.forEach(o => {
      content += `${o.id},${o.created_at},"${o.user?.name || 'Inconnu'}",${o.total_amount},${o.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="paiements_export.csv"`);
    res.send(content);

  } catch (error) {
    res.status(500).json({ message: 'Erreur export' });
  }
});

export default router;
