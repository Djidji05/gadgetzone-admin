import express from 'express';
import sequelize from '../config/database.js';

const router = express.Router();

/**
 * Calculer la date de début selon la période
 */
const getStartDate = (period) => {
  const now = new Date();
  switch (period) {
    case '7j':
      return new Date(now.setDate(now.getDate() - 7));
    case '30j':
      return new Date(now.setDate(now.getDate() - 30));
    case '90j':
      return new Date(now.setDate(now.getDate() - 90));
    case '12m':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
};

/**
 * GET /api/stats/overview
 * Vue d'ensemble des statistiques avec évolution
 */
router.get('/overview', async (req, res) => {
  try {
    const period = req.query.period || '30j';
    const startDate = getStartDate(period);

    // Calculer la période précédente (même durée)
    const periodDuration = new Date() - startDate;
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Statistiques période actuelle - SQL brut
    const [currentStats] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= :startDate
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Statistiques période précédente
    const [previousStats] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= :previousStartDate
        AND created_at < :previousEndDate
    `, {
      replacements: { previousStartDate, previousEndDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Produits vendus (période actuelle)
    const [productsResult] = await sequelize.query(`
      SELECT COALESCE(SUM(oi.quantity), 0) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
        AND o.created_at >= :startDate
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Produits vendus (période précédente)
    const [previousProductsResult] = await sequelize.query(`
      SELECT COALESCE(SUM(oi.quantity), 0) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
        AND o.created_at >= :previousStartDate
        AND o.created_at < :previousEndDate
    `, {
      replacements: { previousStartDate, previousEndDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Nouveaux clients (période actuelle)
    const [newUsersResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= :startDate
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Nouveaux clients (période précédente)
    const [previousNewUsersResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= :previousStartDate
        AND created_at < :previousEndDate
    `, {
      replacements: { previousStartDate, previousEndDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Calculer les valeurs
    const chiffreAffaires = parseFloat(currentStats.revenue || 0);
    const previousRevenue = parseFloat(previousStats.revenue || 0);
    const nbCommandes = parseInt(currentStats.orders || 0);
    const previousOrders = parseInt(previousStats.orders || 0);
    const nbProduitsVendus = parseInt(productsResult.total || 0);
    const previousProducts = parseInt(previousProductsResult.total || 0);
    const newUsersCount = parseInt(newUsersResult.count || 0);
    const previousNewUsersCount = parseInt(previousNewUsersResult.count || 0);

    // Calculer les évolutions (%)
    const evolutionCA = previousRevenue > 0
      ? parseFloat(((chiffreAffaires - previousRevenue) / previousRevenue * 100).toFixed(1))
      : 0;

    const evolutionCommandes = previousOrders > 0
      ? parseFloat(((nbCommandes - previousOrders) / previousOrders * 100).toFixed(1))
      : 0;

    const evolutionProduits = previousProducts > 0
      ? parseFloat(((nbProduitsVendus - previousProducts) / previousProducts * 100).toFixed(1))
      : 0;

    const evolutionClients = previousNewUsersCount > 0
      ? parseFloat(((newUsersCount - previousNewUsersCount) / previousNewUsersCount * 100).toFixed(1))
      : 0;

    const stats = {
      chiffreAffaires,
      evolutionCA,
      nbCommandes,
      evolutionCommandes,
      nbProduitsVendus,
      evolutionProduits,
      nouveauxClients: newUsersCount,
      evolutionClients
    };

    console.log('📊 Stats overview - Period:', period, 'Stats:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Error in stats overview:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * GET /api/stats/top-products
 * Top produits les plus vendus
 */
router.get('/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        c.name as category,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.quantity * oi.price) as revenue,
        15.2 as growth
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status = 'delivered'
      GROUP BY p.id, p.name, c.name
      ORDER BY quantity_sold DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: sequelize.QueryTypes.SELECT
    });

    const formattedProducts = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Non catégorisé',
      quantity_sold: parseInt(product.quantity_sold),
      revenue: parseFloat(product.revenue),
      growth: parseFloat(product.growth)
    }));

    console.log('📊 Top products - Count:', formattedProducts.length);
    res.json(formattedProducts);

  } catch (error) {
    console.error('❌ Error in top products:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits populaires' });
  }
});

/**
 * GET /api/stats/top-clients
 * Top clients par chiffre d'affaires
 */
router.get('/top-clients', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topClients = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.status = 'delivered'
      GROUP BY u.id, u.name
      ORDER BY total_spent DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: sequelize.QueryTypes.SELECT
    });

    const formattedClients = topClients.map(client => ({
      id: client.id,
      name: client.name,
      total_orders: parseInt(client.total_orders),
      total_spent: parseFloat(client.total_spent)
    }));

    console.log('📊 Top clients - Count:', formattedClients.length);
    res.json(formattedClients);

  } catch (error) {
    console.error('❌ Error in top clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des meilleurs clients' });
  }
});

/**
 * GET /api/stats/traffic-sources
 * Sources de trafic (mock pour l'instant)
 */
router.get('/traffic-sources', async (req, res) => {
  try {
    const sources = [
      { source: 'Recherche Google', visits: 1250, percentage: 45.5 },
      { source: 'Réseaux sociaux', visits: 680, percentage: 24.7 },
      { source: 'Direct', visits: 520, percentage: 18.9 },
      { source: 'Email', visits: 180, percentage: 6.5 },
      { source: 'Autres', visits: 120, percentage: 4.4 }
    ];

    console.log('📊 Traffic sources - Mock data');
    res.json(sources);

  } catch (error) {
    console.error('❌ Error in traffic sources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sources de trafic' });
  }
});

/**
 * GET /api/stats/conversion-rate
 * Taux de conversion (mock pour l'instant)
 */
router.get('/conversion-rate', async (req, res) => {
  try {
    const period = req.query.period || '30j';

    const conversionData = {
      current: 3.2,
      evolution: [
        { date: '2024-12-01', rate: 2.8 },
        { date: '2024-12-02', rate: 3.1 },
        { date: '2024-12-03', rate: 3.0 },
        { date: '2024-12-04', rate: 3.2 },
        { date: '2024-12-05', rate: 3.4 },
        { date: '2024-12-06', rate: 3.3 },
        { date: '2024-12-07', rate: 3.2 }
      ]
    };

    console.log('📊 Conversion rate - Period:', period, 'Mock data');
    res.json(conversionData);

  } catch (error) {
    console.error('❌ Error in conversion rate:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du taux de conversion' });
  }
});

/**
 * GET /api/stats/alerts
 * Alertes intelligentes basées sur l'analyse des données réelles
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [];
    const actions = [];

    // 1. Vérifier les produits en stock faible
    const lowStockProducts = await sequelize.query(`
      SELECT id, name, stock
      FROM products
      WHERE stock <= 10 AND stock > 0
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        if (product.stock <= 3) {
          alerts.push({
            id: `stock-critical-${product.id}`,
            niveau: 'critique',
            titre: 'Stock critique',
            description: `Le produit "${product.name}" n'a plus que ${product.stock} unité(s) en stock.`,
            date: 'Maintenant'
          });
        } else {
          alerts.push({
            id: `stock-low-${product.id}`,
            niveau: 'moyen',
            titre: 'Stock faible',
            description: `Le produit "${product.name}" a un stock de ${product.stock} unités.`,
            date: 'Il y a quelques heures'
          });
        }
      });

      actions.push({
        id: 'action-restock',
        description: `Réapprovisionner ${lowStockProducts.length} produit(s) en stock faible`
      });
    }

    // 2. Analyser la baisse des ventes
    const [last7Days] = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL '7 days'
    `, { type: sequelize.QueryTypes.SELECT });

    const [previous7Days] = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL '14 days'
        AND created_at < NOW() - INTERVAL '7 days'
    `, { type: sequelize.QueryTypes.SELECT });

    const currentSales = parseFloat(last7Days.total || 0);
    const previousSales = parseFloat(previous7Days.total || 0);

    if (previousSales > 0) {
      const salesChange = ((currentSales - previousSales) / previousSales) * 100;

      if (salesChange < -10) {
        alerts.push({
          id: 'sales-drop',
          niveau: 'critique',
          titre: 'Baisse significative des ventes',
          description: `Les ventes ont chuté de ${Math.abs(salesChange).toFixed(1)}% cette semaine par rapport à la semaine dernière.`,
          date: 'Il y a 1 heure'
        });

        actions.push({
          id: 'action-marketing',
          description: 'Lancer une campagne promotionnelle pour stimuler les ventes'
        });
      } else if (salesChange < -5) {
        alerts.push({
          id: 'sales-decline',
          niveau: 'moyen',
          titre: 'Légère baisse des ventes',
          description: `Les ventes ont diminué de ${Math.abs(salesChange).toFixed(1)}% cette semaine.`,
          date: 'Il y a 3 heures'
        });
      }
    }

    // 3. Identifier les produits sans ventes récentes
    const productsWithoutSales = await sequelize.query(`
      SELECT p.id, p.name, p.stock
      FROM products p
      WHERE p.id NOT IN (
        SELECT DISTINCT oi.product_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
      )
      AND p.stock > 0
      LIMIT 3
    `, { type: sequelize.QueryTypes.SELECT });

    if (productsWithoutSales.length > 0) {
      alerts.push({
        id: 'no-sales',
        niveau: 'moyen',
        titre: 'Produits sans ventes',
        description: `${productsWithoutSales.length} produit(s) n'ont généré aucune vente depuis 30 jours.`,
        date: 'Il y a 5 heures'
      });

      actions.push({
        id: 'action-promotion',
        description: 'Créer des promotions pour les produits peu vendus'
      });
    }

    // Si aucune alerte, ajouter un message positif
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-good',
        niveau: 'bas',
        titre: 'Tout va bien !',
        description: 'Aucun problème détecté. Vos opérations se déroulent normalement.',
        date: 'Maintenant'
      });
    }

    // Ajouter des actions génériques si peu d'actions spécifiques
    if (actions.length < 3) {
      actions.push({
        id: 'action-analytics',
        description: 'Analyser les performances des campagnes marketing'
      });

      if (actions.length < 3) {
        actions.push({
          id: 'action-customer-feedback',
          description: 'Collecter les retours clients pour améliorer l\'expérience'
        });
      }
    }

    console.log('🚨 Alerts generated:', alerts.length, 'Actions:', actions.length);

    res.json({
      alertes: alerts,
      actionsRecommandees: actions
    });

  } catch (error) {
    console.error('❌ Error in alerts:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des alertes' });
  }
});

/**
 * GET /api/stats/revenue-evolution
 * Évolution du chiffre d'affaires par période
 */
router.get('/revenue-evolution', async (req, res) => {
  try {
    const type = req.query.type || 'mois'; // jour, semaine, mois

    let groupBy, dateFormat, interval;

    switch (type) {
      case 'jour':
        groupBy = "DATE(created_at)";
        dateFormat = 'DD/MM';
        interval = '30 days';
        break;
      case 'semaine':
        groupBy = "DATE_TRUNC('week', created_at)";
        dateFormat = 'DD/MM';
        interval = '12 weeks';
        break;
      default: // mois
        groupBy = "TO_CHAR(created_at, 'YYYY-MM')";
        dateFormat = 'MMM YYYY';
        interval = '12 months';
    }

    const revenueData = await sequelize.query(`
      SELECT 
        ${groupBy} as period,
        SUM(total_amount) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY ${groupBy}
      ORDER BY ${groupBy}
    `, { type: sequelize.QueryTypes.SELECT });

    const labels = revenueData.map(d => {
      if (type === 'mois') {
        return d.period;
      } else {
        return new Date(d.period).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      }
    });

    const data = revenueData.map(d => parseFloat(d.total || 0));

    console.log('📊 Revenue evolution - Type:', type, 'Data points:', data.length);
    res.json({ labels, data });

  } catch (error) {
    console.error('❌ Error in revenue evolution:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution du CA' });
  }
});

/**
 * GET /api/stats/sales-by-category
 * Répartition des ventes par catégorie
 */
router.get('/sales-by-category', async (req, res) => {
  try {
    const salesByCategory = await sequelize.query(`
      SELECT 
        COALESCE(c.name, 'Non catégorisé') as category,
        SUM(oi.quantity * oi.price) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status = 'delivered'
      GROUP BY c.name
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

    const labels = salesByCategory.map(d => d.category);
    const data = salesByCategory.map(d => parseFloat(d.total || 0));

    console.log('📊 Sales by category - Categories:', labels.length);
    res.json({ labels, data });

  } catch (error) {
    console.error('❌ Error in sales by category:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la répartition des ventes' });
  }
});

/**
 * GET /api/stats/monthly-target
 * Objectif mensuel et progression
 */
router.get('/monthly-target', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Objectif mensuel fixe (peut être configuré)
    const monthlyTarget = 20000; // 20K HTG

    // Revenus du mois en cours
    const [currentMonthRevenue] = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= :startOfMonth
    `, {
      replacements: { startOfMonth },
      type: sequelize.QueryTypes.SELECT
    });

    // Revenus du mois dernier
    const [lastMonthRevenue] = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= :startOfLastMonth
        AND created_at < :startOfMonth
    `, {
      replacements: { startOfLastMonth, startOfMonth },
      type: sequelize.QueryTypes.SELECT
    });

    // Revenus d'aujourd'hui
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [todayRevenue] = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= :startOfToday
    `, {
      replacements: { startOfToday },
      type: sequelize.QueryTypes.SELECT
    });

    const currentRevenue = parseFloat(currentMonthRevenue.total || 0);
    const lastRevenue = parseFloat(lastMonthRevenue.total || 0);
    const todayTotal = parseFloat(todayRevenue.total || 0);

    // Calculer le pourcentage de progression
    const progressPercentage = monthlyTarget > 0
      ? parseFloat(((currentRevenue / monthlyTarget) * 100).toFixed(2))
      : 0;

    // Calculer l'évolution par rapport au mois dernier
    const monthOverMonthGrowth = lastRevenue > 0
      ? parseFloat(((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1))
      : 0;

    const response = {
      target: monthlyTarget,
      currentRevenue: currentRevenue,
      todayRevenue: todayTotal,
      lastMonthRevenue: lastRevenue,
      progressPercentage: progressPercentage,
      monthOverMonthGrowth: monthOverMonthGrowth
    };

    console.log('📊 Monthly target stats:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in monthly target:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'objectif mensuel' });
  }
});

/**
 * GET /api/stats/customer-demographics
 * Démographie des clients
 */
router.get('/customer-demographics', async (req, res) => {
  try {
    // Total des clients
    const [totalCustomers] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE role != 'admin'
    `, { type: sequelize.QueryTypes.SELECT });

    // Nouveaux clients ce mois
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [newThisMonth] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE role != 'admin'
        AND created_at >= :startOfMonth
    `, {
      replacements: { startOfMonth },
      type: sequelize.QueryTypes.SELECT
    });

    // Clients actifs (ayant passé au moins une commande)
    const [activeCustomers] = await sequelize.query(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM orders
    `, { type: sequelize.QueryTypes.SELECT });

    // Clients par rôle (statistique alternative)
    const topRoles = await sequelize.query(`
      SELECT 
        CASE 
          WHEN role = 'admin' THEN 'Administrateurs'
          WHEN role = 'gestionnaire' THEN 'Gestionnaires'
          ELSE 'Clients'
        END as category,
        COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    const total = parseInt(totalCustomers.total || 0);
    const newCustomers = parseInt(newThisMonth.total || 0);
    const active = parseInt(activeCustomers.total || 0);

    const response = {
      totalCustomers: total,
      newThisMonth: newCustomers,
      activeCustomers: active,
      activePercentage: total > 0 ? parseFloat(((active / total) * 100).toFixed(1)) : 0,
      topCities: topRoles.map(role => ({
        name: role.category,
        count: parseInt(role.count),
        percentage: total > 0 ? parseFloat(((role.count / total) * 100).toFixed(1)) : 0
      }))
    };

    console.log('📊 Customer demographics:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in customer demographics:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données démographiques' });
  }
});

export default router;

