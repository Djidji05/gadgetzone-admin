import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Order, OrderItem, Product, Store } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// 🔒 SÉCURITÉ: Toutes les routes financères sont réservées aux administrateurs
router.use(authenticateToken, requireAdmin);

/**
 * Utilitaire pour récupérer la date de début basée sur la période
 */
const getStartDate = (period) => {
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (period) {
        case 'month':
            start.setDate(1);
            return start;
        case 'quarter':
            start.setMonth(now.getMonth() - 3);
            return start;
        case 'year':
            start.setMonth(0, 1);
            return start;
        case 'all':
        default:
            return new Date(0); // Jan 1st 1970
    }
};

/**
 * GET /api/finance/overview
 * Retourne les KPIs financiers globaux
 */
router.get('/overview', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const startDate = getStartDate(period);

        // Date de début pour la comparaison de croissance (Mois en cours vs Mois précédent)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const lastMonthStart = new Date(currentMonthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        // Exécuter tous les calculs financiers en parallèle pour une performance maximale
        const [
            gmvRows,
            commissionRows,
            paymentsRows,
            refundsRows,
            expensesRows,
            depositRows,
            payoutRows,
            availableBalanceRows,
            pendingBalanceRows,
            currentMonthRows,
            lastMonthRows
        ] = await Promise.all([
            // 1. GMV
            sequelize.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered' AND created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 2. Revenu Marketplace (Commissions)
            sequelize.query(`SELECT COALESCE(SUM(oi.price * oi.quantity * s.commission_rate / 100), 0) as total
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN stores s ON p."storeId" = s.id
                WHERE o.status = 'delivered' AND o.created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 3. Paiements reçus (gross)
            sequelize.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled' AND created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 4. Refunds
            sequelize.query(`SELECT COALESCE(SUM(refund_amount), 0) as total FROM refunds WHERE status = 'completed' AND created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 5. Expenses
            sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 6. Deposits
            sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed' AND created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 7. Payouts
            sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payouts WHERE status = 'completed' AND created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 8. Available Balance
            sequelize.query(`SELECT COALESCE(SUM(oi.price * oi.quantity * (1 - (s.commission_rate / 100))), 0) as total
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN stores s ON p."storeId" = s.id
                WHERE o.status = 'delivered' AND o.created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 9. Pending Balance
            sequelize.query(`SELECT COALESCE(SUM(oi.price * oi.quantity * (1 - (s.commission_rate / 100))), 0) as total
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN stores s ON p."storeId" = s.id
                WHERE o.status IN ('pending', 'processing', 'shipped', 'confirmed') AND o.created_at >= :startDate`, 
                { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }),
            // 10. Current Month Revenue (Growth)
            sequelize.query(`SELECT COALESCE(SUM(oi.price * oi.quantity * s.commission_rate / 100), 0) as total
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN stores s ON p."storeId" = s.id
                WHERE o.status = 'delivered' AND o.created_at >= :currentMonthStart`, 
                { replacements: { currentMonthStart }, type: sequelize.QueryTypes.SELECT }),
            // 11. Last Month Revenue (Growth)
            sequelize.query(`SELECT COALESCE(SUM(oi.price * oi.quantity * s.commission_rate / 100), 0) as total
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN stores s ON p."storeId" = s.id
                WHERE o.status = 'delivered' AND o.created_at >= :lastMonthStart AND o.created_at < :currentMonthStart`, 
                { replacements: { lastMonthStart, currentMonthStart }, type: sequelize.QueryTypes.SELECT })
        ]);

        const totalGMV = parseFloat(gmvRows[0]?.total || 0);
        const totalRevenue = parseFloat(commissionRows[0]?.total || 0);
        const totalRefunds = parseFloat(refundsRows[0]?.total || 0);
        const totalPayments = parseFloat(paymentsRows[0]?.total || 0) - totalRefunds;
        const totalExpenses = parseFloat(expensesRows[0]?.total || 0);
        const netProfit = totalRevenue - totalExpenses;
        
        const availableLedger = parseFloat(availableBalanceRows[0]?.total || 0) + parseFloat(depositRows[0]?.total || 0) - parseFloat(payoutRows[0]?.total || 0);
        const pendingLedger = parseFloat(pendingBalanceRows[0]?.total || 0);

        const currentRev = parseFloat(currentMonthRows[0]?.total || 0);
        const lastRev = parseFloat(lastMonthRows[0]?.total || 0);
        const revenueGrowth = lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 0;

        res.json({
            totalGMV,
            totalRevenue,
            totalExpenses,
            netProfit,
            totalPayments,
            totalRefunds,
            ledger: {
                available: availableLedger,
                pending: pendingLedger
            },
            growth: {
                revenue: parseFloat(revenueGrowth.toFixed(1)),
                expenses: -3.2,
                profit: parseFloat(((revenueGrowth + 3.2) / 2).toFixed(1)),
                payments: 8.3
            }
        });

    } catch (error) {
        console.error('Erreur overview finance:', error);
        if (error.parent) console.error('SQL Error:', error.parent);
        if (error.original) console.error('Original Error:', error.original);
        res.status(500).json({ error: 'Erreur lors de la récupération des données financières' });
    }
});

/**
 * GET /api/finance/revenue-chart
 * Retourne l'évolution des revenus mensuels
 */
router.get('/revenue-chart', async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        let interval = '12 months';
        if (period === 'yearly') interval = '5 years';

        // Récupérer les revenus basés sur l'intervalle
        const monthlyRevenue = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL :interval
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `, { 
        replacements: { interval },
        type: sequelize.QueryTypes.SELECT 
    });

        // Créer un tableau avec tous les mois
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const data = new Array(12).fill(0);

        // Remplir avec les données réelles
        monthlyRevenue.forEach(row => {
            const monthIndex = parseInt(row.month_num) - 1;
            data[monthIndex] = parseFloat(row.revenue || 0);
        });

        res.json({
            labels: months,
            data
        });

    } catch (error) {
        console.error('Erreur revenue chart:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des revenus' });
    }
});

/**
 * GET /api/finance/expenses
 * Liste des dépenses avec filtrage optionnel
 */
router.get('/expenses', async (req, res) => {
    try {
        const { category = 'all', page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = category !== 'all' ? { category } : {};

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where,
            order: [['date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            raw: true // ⚡ Performance: charger des données simples, pas des instances modèles
        });

        // Calculer le total via SQL SUM pour économiser la mémoire (plus de .reduce() sur tout le dataset)
        const totalResult = await Expense.findOne({
            where,
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });

        res.json({
            expenses: expenses.map(exp => ({
                ...exp,
                amount: parseFloat(exp.amount)
            })),
            total: parseFloat(totalResult?.total || 0),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Erreur liste dépenses:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des dépenses' });
    }
});

/**
 * POST /api/finance/expenses
 * Créer une nouvelle dépense
 */
router.post('/expenses', async (req, res) => {
    try {
        const { category, description, amount, date, paymentMethod, notes, recurring } = req.body;

        if (!category || !description || !amount || !date || !paymentMethod) {
            return res.status(400).json({ error: 'Champs requis manquants' });
        }

        const expense = await Expense.create({
            category,
            description,
            amount,
            date,
            payment_method: paymentMethod,
            notes,
            recurring: recurring || false,
            status: 'completed'
        });

        res.status(201).json({
            id: expense.id,
            date: expense.date,
            category: expense.category,
            description: expense.description,
            amount: parseFloat(expense.amount),
            paymentMethod: expense.payment_method,
            notes: expense.notes,
            recurring: expense.recurring,
            status: expense.status
        });

    } catch (error) {
        console.error('Erreur création dépense:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la dépense' });
    }
});

/**
 * DELETE /api/finance/expenses/:id
 * Supprimer une dépense
 */
router.delete('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json({ error: 'Dépense non trouvée' });
        }

        await expense.destroy();
        res.json({ message: 'Dépense supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression dépense:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la dépense' });
    }
});

/**
 * GET /api/finance/expenses-breakdown
 * Répartition des dépenses par catégorie
 */
router.get('/expenses-breakdown', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const startDate = getStartDate(period);

        const breakdown = await sequelize.query(`
      SELECT 
        category,
        SUM(amount) as total
      FROM expenses
      WHERE date >= :startDate
      GROUP BY category
      ORDER BY total DESC
    `, { 
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT 
    });

        const totalExpenses = breakdown.reduce((sum, cat) => sum + parseFloat(cat.total), 0);

        const categories = [];
        const values = [];
        const amounts = [];

        breakdown.forEach(cat => {
            const categoryLabels = {
                salaires: 'Salaires',
                marketing: 'Marketing',
                operations: 'Opérations',
                technologie: 'Technologie',
                fournitures: 'Fournitures',
                loyer: 'Loyer',
                utilities: 'Services publics',
                autres: 'Autres'
            };

            categories.push(categoryLabels[cat.category] || cat.category);
            const amount = parseFloat(cat.total);
            amounts.push(amount);
            values.push(totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0);
        });

        res.json({
            categories,
            values,
            amounts
        });

    } catch (error) {
        console.error('Erreur breakdown dépenses:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la répartition' });
    }
});

/**
 * GET /api/finance/profit-trend
 * Tendance Profit/Perte mensuelle
 */
router.get('/profit-trend', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        let interval = '12 months';
        if (period === 'year') interval = '5 years';

        // Charger revenus et dépenses mensuels en parallèle
        const [monthlyRevenue, monthlyExpenses] = await Promise.all([
            sequelize.query(`
                SELECT 
                    EXTRACT(MONTH FROM created_at) as month_num,
                    SUM(total_amount) / 1000 as revenue
                FROM orders
                WHERE status = 'delivered'
                    AND created_at >= NOW() - INTERVAL :interval
                GROUP BY EXTRACT(MONTH FROM created_at)
                ORDER BY EXTRACT(MONTH FROM created_at)
            `, { replacements: { interval }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query(`
                SELECT 
                    EXTRACT(MONTH FROM date) as month_num,
                    SUM(amount) / 1000 as expenses
                FROM expenses
                WHERE date >= NOW() - INTERVAL :interval
                GROUP BY EXTRACT(MONTH FROM date)
                ORDER BY EXTRACT(MONTH FROM date)
            `, { replacements: { interval }, type: sequelize.QueryTypes.SELECT })
        ]);

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const revenue = new Array(12).fill(0);
        const expenses = new Array(12).fill(0);

        monthlyRevenue.forEach(row => {
            const monthIndex = parseInt(row.month_num) - 1;
            revenue[monthIndex] = parseFloat(row.revenue || 0);
        });

        monthlyExpenses.forEach(row => {
            const monthIndex = parseInt(row.month_num) - 1;
            expenses[monthIndex] = parseFloat(row.expenses || 0);
        });

        res.json({
            months,
            revenue,
            expenses
        });

    } catch (error) {
        console.error('Erreur profit trend:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la tendance' });
    }
});

/**
 * GET /api/finance/payment-methods
 * Distribution des méthodes de paiement
 */
router.get('/payment-methods', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const startDate = getStartDate(period);

        const methodsData = await sequelize.query(`
            SELECT payment_method, SUM(total_amount) as total
            FROM orders
            WHERE status IN ('delivered', 'confirmed', 'shipped')
              AND created_at >= :startDate
            GROUP BY payment_method
        `, { 
            replacements: { startDate },
            type: sequelize.QueryTypes.SELECT 
        });

        let totalRevenue = 0;
        methodsData.forEach(row => totalRevenue += parseFloat(row.total || 0));

        const methods = [];
        const percentages = [];
        const amounts = [];

        if (totalRevenue === 0) {
            return res.json({
                methods: ['Aucune donnée'],
                percentages: [100],
                amounts: [0]
            });
        }

        methodsData.forEach(row => {
            const amount = parseFloat(row.total || 0);
            methods.push(row.payment_method || 'Inconnu');
            amounts.push(amount);
            percentages.push(Math.round((amount / totalRevenue) * 100));
        });

        res.json({
            methods,
            percentages,
            amounts
        });

    } catch (error) {
        console.error('Erreur payment methods:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des méthodes de paiement' });
    }
});

/**
 * GET /api/finance/transactions
 * Transactions récentes (mix revenus/dépenses)
 */
router.get('/transactions', async (req, res) => {
    try {
        const { limit = 10, type = 'all' } = req.query;

        const transactions = [];

        // Récupérer revenus et dépenses en parallèle
        const [orders, expenses] = await Promise.all([
            (type === 'all' || type === 'revenue') 
                ? Order.findAll({
                    where: { status: { [Op.ne]: 'cancelled' } },
                    attributes: ['id', 'total_amount', 'status', 'created_at'], // ⚡ Ne charger que le nécessaire
                    order: [['created_at', 'DESC']],
                    limit: parseInt(limit),
                    raw: true
                })
                : Promise.resolve([]),
            (type === 'all' || type === 'expense')
                ? Expense.findAll({
                    order: [['date', 'DESC']],
                    limit: parseInt(limit),
                    raw: true
                })
                : Promise.resolve([])
        ]);

        if (orders.length > 0) {
            orders.forEach(order => {
                transactions.push({
                    id: `order-${order.id}`,
                    date: order.created_at.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    description: `Vente commande #${order.id}`,
                    type: 'revenue',
                    amount: parseFloat(order.total_amount),
                    status: order.status === 'delivered' ? 'completed' : 'pending'
                });
            });
        }

        if (expenses.length > 0) {
            expenses.forEach(expense => {
                transactions.push({
                    id: `expense-${expense.id}`,
                    date: new Date(expense.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    description: expense.description,
                    type: 'expense',
                    amount: parseFloat(expense.amount),
                    status: expense.status,
                    category: expense.category
                });
            });
        }

        // Trier par date (plus récent en premier)
        transactions.sort((a, b) => {
            const dateA = new Date(a.date.split(' ').reverse().join('-'));
            const dateB = new Date(b.date.split(' ').reverse().join('-'));
            return dateB - dateA;
        });

        res.json({
            transactions: transactions.slice(0, parseInt(limit))
        });

    } catch (error) {
        console.error('Erreur transactions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
});

export default router;
