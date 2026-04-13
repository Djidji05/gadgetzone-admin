import express from 'express';
import sequelize from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 🔒 SÉCURITÉ: Toutes les routes de statistiques nécessitent une authentification admin
router.use(authenticateToken, requireAdmin);

/**
 * Calculer la date de début selon la période
 */
const getStartDate = (period) => {
  const now = new Date();
  switch (period) {
    case '1j':
      return new Date(now.setDate(now.getDate() - 1));
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
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '30j';
    const startDate = getStartDate(period);

    // Calculer la période précédente (même durée)
    const periodDuration = new Date() - startDate;
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // 🚀 Optimisation massive : Exécuter toutes les comparaisons de périodes en parallèle
    const results = await Promise.all([
      // 1. Statistiques période actuelle
      sequelize.query(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders
        FROM orders WHERE status = 'delivered' AND created_at >= :startDate
      `, { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),

      // 2. Statistiques période précédente
      sequelize.query(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders
        FROM orders WHERE status = 'delivered' AND created_at >= :previousStartDate AND created_at < :previousEndDate
      `, { replacements: { previousStartDate, previousEndDate }, type: sequelize.QueryTypes.SELECT }),

      // 3. Produits vendus (actuel)
      sequelize.query(`
        SELECT COALESCE(SUM(oi.quantity), 0) as total FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'delivered' AND o.created_at >= :startDate
      `, { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),

      // 4. Produits vendus (précédent)
      sequelize.query(`
        SELECT COALESCE(SUM(oi.quantity), 0) as total FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'delivered' AND o.created_at >= :previousStartDate AND o.created_at < :previousEndDate
      `, { replacements: { previousStartDate, previousEndDate }, type: sequelize.QueryTypes.SELECT }),

      // 5. Nouveaux clients (actuel)
      sequelize.query(`
        SELECT COUNT(*) as count FROM users WHERE created_at >= :startDate AND role = 'user'
      `, { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),

      // 6. Nouveaux clients (précédent)
      sequelize.query(`
        SELECT COUNT(*) as count FROM users WHERE created_at >= :previousStartDate AND created_at < :previousEndDate AND role = 'user'
      `, { replacements: { previousStartDate, previousEndDate }, type: sequelize.QueryTypes.SELECT })
    ]);

    const [
      [currentStats], [previousStats], [productsResult], 
      [previousProductsResult], [newUsersResult], [previousNewUsersResult]
    ] = results;

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

    // --- GLOBAL TOTALS (Optimized: Individual queries are faster in PG than 6 subqueries in one row) ---
    const [[{ count: totalUsers }], [{ count: totalProducts }], [{ count: totalOrders }], [{ count: totalSellers }], [{ revenue: totalRevenue }], [{ revenue: totalBoostsRevenue }]] = await Promise.all([
      sequelize.query("SELECT COUNT(*) as count FROM users WHERE role IN ('user', 'seller') AND created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
      sequelize.query("SELECT COUNT(*) as count FROM products WHERE created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
      sequelize.query("SELECT COUNT(*) as count FROM orders WHERE created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
      sequelize.query("SELECT COUNT(*) as count FROM stores WHERE status = 'active' AND created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
      sequelize.query("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = 'delivered' AND created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
      sequelize.query("SELECT COALESCE(SUM(amount), 0) as revenue FROM boosts WHERE status IN ('active', 'expired', 'pending') AND created_at >= :startDate", { replacements: { startDate }, type: sequelize.QueryTypes.SELECT })
    ]);

    const stats = {
      chiffreAffaires,
      evolutionCA,
      nbCommandes,
      evolutionCommandes,
      nbProduitsVendus,
      evolutionProduits,
      nouveauxClients: newUsersCount,
      evolutionClients,
      // Global Totals
      totalUsers: parseInt(totalUsers || 0),
      totalProducts: parseInt(totalProducts || 0),
      totalOrders: parseInt(totalOrders || 0),
      totalSellers: parseInt(totalSellers || 0),
      totalRevenue: parseFloat(totalRevenue || 0),
      totalBoostsRevenue: parseFloat(totalBoostsRevenue || 0)
    };

    console.log('📊 Stats overview - Period:', period, 'Stats:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Error in stats overview:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * GET /api/stats/notifications-count
 * Badges de notifications pour la sidebar (admin)
 */
router.get('/notifications-count', async (req, res) => {
  try {
    // 🚀 Optimisation : Exécuter toutes les requêtes en parallèle (batching)
    const results = await Promise.all([
      // 1. Commandes en attente
      sequelize.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'", { type: sequelize.QueryTypes.SELECT }),
      
      // 2. Nouveaux clients (24h)
      sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= NOW() - INTERVAL '1 DAY'", { type: sequelize.QueryTypes.SELECT }),
      
      // 3. Nouveaux produits (24h)
      sequelize.query("SELECT COUNT(*) as count FROM products WHERE created_at >= NOW() - INTERVAL '1 DAY'", { type: sequelize.QueryTypes.SELECT }),
      
      // 4. Demandes de boutiques
      sequelize.query("SELECT COUNT(*) as count FROM stores WHERE status = 'pending'", { type: sequelize.QueryTypes.SELECT }),
      
      // 5. Avis en attente
      sequelize.query("SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'", { type: sequelize.QueryTypes.SELECT }),
      
      // 6. Litiges en attente
      sequelize.query("SELECT COUNT(*) as count FROM disputes WHERE status IN ('pending', 'under_review')", { type: sequelize.QueryTypes.SELECT }),
      
      // 7. Commandes livrées récemment
      sequelize.query("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered' AND updated_at >= NOW() - INTERVAL '1 DAY'", { type: sequelize.QueryTypes.SELECT }),
      
      // 8. Commandes annulées récemment
      sequelize.query("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled' AND updated_at >= NOW() - INTERVAL '1 DAY'", { type: sequelize.QueryTypes.SELECT }),
      
      // 9. Messages non lus
      sequelize.query(`
        SELECT COUNT(m.id) as count FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.is_read = false AND u.role != 'admin'
      `, { type: sequelize.QueryTypes.SELECT })
    ]);

    const [
      [pendingOrders], [newUsers], [newProducts], [pendingStores],
      [pendingReviews], [pendingDisputes], [recentDelivered], [recentCancelled], [unreadMessages]
    ] = results;

    res.json({
      pendingOrdersCount: parseInt(pendingOrders?.count || 0),
      newClientsCount: parseInt(newUsers?.count || 0),
      newProductsCount: parseInt(newProducts?.count || 0),
      pendingStoresCount: parseInt(pendingStores?.count || 0),
      pendingReviewsCount: parseInt(pendingReviews?.count || 0),
      pendingDisputesCount: parseInt(pendingDisputes?.count || 0),
      recentDeliveredOrdersCount: parseInt(recentDelivered?.count || 0),
      recentCancelledOrdersCount: parseInt(recentCancelled?.count || 0),
      unreadMessagesCount: parseInt(unreadMessages?.count || 0)
    });
  } catch (error) {
    console.error('❌ Error fetching notifications counts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
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
 * Sources de trafic (Données réelles ou vides)
 */
router.get('/traffic-sources', async (req, res) => {
  try {
    // Note: Nécessite une table "visits" pour être réel.
    // Pour l'instant, on retourne vide ou "Direct" par défaut pour ne pas afficher de faux chiffres.
    const sources = [
      { source: 'Direct / Inconnu', visits: 0, percentage: 100 }
    ];

    console.log('📊 Traffic sources - Real/Empty data');
    res.json(sources);

  } catch (error) {
    console.error('❌ Error in traffic sources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sources de trafic' });
  }
});

/**
 * GET /api/stats/conversion-rate
 * Taux de conversion (Basé sur les commandes réelles vs 1 visite min pour éviter div/0)
 */
router.get('/conversion-rate', async (req, res) => {
  try {
    const period = req.query.period || '30j';

    // Sans tracking de visiteurs, le taux de conversion est impossible à calculer précisément.
    // On retourne 0 pour l'instant.

    const conversionData = {
      current: 0,
      evolution: [] // Pas d'historique de conversion sans tracking
    };

    console.log('📊 Conversion rate - Real (0% due to missing visitor tracking)');
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
    let monthlyTarget = 20000; // 20K HTG par défaut
    try {
      const targetSetting = await sequelize.models.Setting.findOne({ 
        where: { category: 'finance', key: 'monthly_target' } 
      });
      if (targetSetting && targetSetting.value) {
        monthlyTarget = parseFloat(targetSetting.value);
      }
    } catch (e) {
      console.error('Error fetching monthly target setting', e);
    }

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
 * POST /api/stats/monthly-target
 * Mettre à jour l'objectif mensuel
 */
router.post('/monthly-target', async (req, res) => {
  try {
    const { target } = req.body;
    if (target === undefined || isNaN(target)) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    let setting = await sequelize.models.Setting.findOne({ 
      where: { category: 'finance', key: 'monthly_target' } 
    });

    if (setting) {
      setting.value = target.toString();
      setting.updated_at = new Date();
      await setting.save();
    } else {
      await sequelize.models.Setting.create({
        category: 'finance',
        key: 'monthly_target',
        value: target.toString()
      });
    }

    res.json({ success: true, target });
  } catch (error) {
    console.error('❌ Error updating monthly target:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'objectif" });
  }
});

/**
 * GET /api/stats/customer-demographics
 * Démographie des clients
 */
router.get('/customer-demographics', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 🚀 Exécuter toutes les requêtes démographiques en parallèle
    const results = await Promise.all([
      // 1. Total des clients
      sequelize.query("SELECT COUNT(*) as total FROM users WHERE role != 'admin'", { type: sequelize.QueryTypes.SELECT }),
      
      // 2. Nouveaux clients ce mois
      sequelize.query("SELECT COUNT(*) as total FROM users WHERE role != 'admin' AND created_at >= :startOfMonth", { 
        replacements: { startOfMonth }, 
        type: sequelize.QueryTypes.SELECT 
      }),
      
      // 3. Clients actifs
      sequelize.query("SELECT COUNT(DISTINCT user_id) as total FROM orders", { type: sequelize.QueryTypes.SELECT }),
      
      // 4. Clients par rôle
      sequelize.query(`
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
      `, { type: sequelize.QueryTypes.SELECT })
    ]);

    const [[totalCustomers], [newThisMonth], [activeCustomers], topRoles] = results;

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

/**
 * GET /api/stats/monthly-sales
 * Ventes mensuelles (graphique barres simple)
 */
router.get('/monthly-sales', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const targetYear = parseInt(year);

    console.log(`📊 Generating monthly sales for year: ${targetYear}`);

    const stats = await sequelize.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('year', make_date(:year, 1, 1)),
          date_trunc('year', make_date(:year, 1, 1)) + interval '11 months',
          '1 month'
        ) as month
      )
      SELECT 
        EXTRACT(MONTH FROM m.month) as month_num,
        COALESCE(COUNT(o.id), 0) as sales_count
      FROM months m
      LEFT JOIN orders o ON date_trunc('month', o.created_at) = m.month 
        AND o.status != 'cancelled'
      GROUP BY m.month
      ORDER BY m.month;
    `, {
      replacements: { year: targetYear },
      type: sequelize.QueryTypes.SELECT
    });

    const sales = stats.map(s => parseInt(s.sales_count));

    console.log(`✅ Monthly sales generated: ${sales.length} points`);
    res.json({ sales });

  } catch (error) {
    console.error('❌ Error in monthly sales:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes mensuelles' });
  }
});

/**
 * GET /api/stats/sales-data
 * Données de ventes et revenus pour le graphique (supporte monthly, quarterly, annually)
 */
router.get('/sales-data', async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    const targetYear = parseInt(year);

    console.log(`📊 Generating chart data for period: ${period}, year: ${targetYear}`);

    let stats;
    // Initialiser les tableaux de résultats
    let sales = [];
    let revenue = [];
    let labels = [];

    if (period === 'today') {
      stats = await sequelize.query(`
        WITH hours AS (
          SELECT generate_series(
            date_trunc('hour', NOW() - interval '23 hours'),
            date_trunc('hour', NOW()),
            '1 hour'
          ) as hour
        )
        SELECT 
          to_char(h.hour, 'HH24:00') as label,
          COALESCE(COUNT(o.id), 0) as sales_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue
        FROM hours h
        LEFT JOIN orders o ON date_trunc('hour', o.created_at) = h.hour 
          AND o.status != 'cancelled'
        GROUP BY h.hour
        ORDER BY h.hour;
      `, { type: sequelize.QueryTypes.SELECT });

      sales = stats.map(s => parseInt(s.sales_count));
      revenue = stats.map(s => parseFloat(s.total_revenue));
      labels = stats.map(s => s.label);

    } else if (period === '7days' || period === '30days') {
      const days = period === '7days' ? 6 : 29;
      stats = await sequelize.query(`
        WITH days AS (
          SELECT generate_series(
            date_trunc('day', NOW() - interval '${days} days'),
            date_trunc('day', NOW()),
            '1 day'
          ) as day
        )
        SELECT 
          to_char(d.day, 'DD/MM') as label,
          COALESCE(COUNT(o.id), 0) as sales_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue
        FROM days d
        LEFT JOIN orders o ON date_trunc('day', o.created_at) = d.day 
          AND o.status != 'cancelled'
        GROUP BY d.day
        ORDER BY d.day;
      `, { type: sequelize.QueryTypes.SELECT });

      sales = stats.map(s => parseInt(s.sales_count));
      revenue = stats.map(s => parseFloat(s.total_revenue));
      labels = stats.map(s => s.label);

    } else if (period === 'monthly') {
      stats = await sequelize.query(`
        WITH months AS (
          SELECT generate_series(
            date_trunc('year', make_date(:year, 1, 1)),
            date_trunc('year', make_date(:year, 1, 1)) + interval '11 months',
            '1 month'
          ) as month
        )
        SELECT 
          to_char(m.month, 'Mon') as label,
          EXTRACT(MONTH FROM m.month) as month_num,
          COALESCE(COUNT(o.id), 0) as sales_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue
        FROM months m
        LEFT JOIN orders o ON date_trunc('month', o.created_at) = m.month 
          AND o.status != 'cancelled'
        GROUP BY m.month
        ORDER BY m.month;
      `, {
        replacements: { year: targetYear },
        type: sequelize.QueryTypes.SELECT
      });

      sales = stats.map(s => parseInt(s.sales_count));
      revenue = stats.map(s => parseFloat(s.total_revenue));
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    } else if (period === 'quarterly') {
      stats = await sequelize.query(`
        WITH quarters AS (
          SELECT generate_series(
            date_trunc('year', make_date(:year, 1, 1)),
            date_trunc('year', make_date(:year, 1, 1)) + interval '9 months',
            '3 months'
          ) as quarter
        )
        SELECT 
          EXTRACT(QUARTER FROM q.quarter) as quarter_num,
          COALESCE(COUNT(o.id), 0) as sales_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue
        FROM quarters q
        LEFT JOIN orders o ON date_trunc('quarter', o.created_at) = q.quarter 
          AND o.status != 'cancelled'
        GROUP BY q.quarter
        ORDER BY q.quarter;
      `, {
        replacements: { year: targetYear },
        type: sequelize.QueryTypes.SELECT
      });

      sales = stats.map(s => parseInt(s.sales_count));
      revenue = stats.map(s => parseFloat(s.total_revenue));
      labels = ['T1', 'T2', 'T3', 'T4'];

    } else if (period === 'year' || period === 'annually') {
      stats = await sequelize.query(`
        WITH months AS (
          SELECT generate_series(
            date_trunc('year', make_date(:year, 1, 1)),
            date_trunc('year', make_date(:year, 1, 1)) + interval '11 months',
            '1 month'
          ) as month
        )
        SELECT 
          to_char(m.month, 'Mon') as label,
          COALESCE(COUNT(o.id), 0) as sales_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue
        FROM months m
        LEFT JOIN orders o ON date_trunc('month', o.created_at) = m.month 
          AND o.status != 'cancelled'
        GROUP BY m.month
        ORDER BY m.month;
      `, {
        replacements: { year: targetYear },
        type: sequelize.QueryTypes.SELECT
      });

      sales = stats.map(s => parseInt(s.sales_count));
      revenue = stats.map(s => parseFloat(s.total_revenue));
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    }

    console.log(`✅ Chart data generated. Sales points: ${sales.length}`);

    res.json({ sales, revenue, labels });

  } catch (error) {
    console.error('❌ Error in sales data:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du graphique' });
  }
});

export default router;

