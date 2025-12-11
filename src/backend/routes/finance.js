import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Order } from '../models/index.js';
import Expense from '../models/Expense.js';

const router = express.Router();

/**
 * GET /api/finance/overview
 * Retourne les KPIs financiers globaux
 */
router.get('/overview', async (req, res) => {
    try {
        // Calculer les revenus totaux (commandes livrées)
        const revenueResult = await Order.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'total']],
            where: { status: 'delivered' }
        });
        const totalRevenue = parseFloat(revenueResult?.dataValues?.total || 0);

        // Calculer les paiements reçus (toutes commandes sauf annulées)
        const paymentsResult = await Order.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'total']],
            where: { status: { [Op.ne]: 'cancelled' } }
        });
        const totalPayments = parseFloat(paymentsResult?.dataValues?.total || 0);

        // Calculer les dépenses totales
        const expensesResult = await Expense.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
        });
        const totalExpenses = parseFloat(expensesResult?.dataValues?.total || 0);

        // Calculer le profit net
        const netProfit = totalRevenue - totalExpenses;

        // Calculer les croissances (mois actuel vs mois précédent)
        const currentMonth = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const currentMonthRevenue = await Order.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'total']],
            where: {
                status: 'delivered',
                created_at: {
                    [Op.gte]: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                }
            }
        });

        const lastMonthRevenue = await Order.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'total']],
            where: {
                status: 'delivered',
                created_at: {
                    [Op.gte]: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
                    [Op.lt]: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                }
            }
        });

        const currentRev = parseFloat(currentMonthRevenue?.dataValues?.total || 0);
        const lastRev = parseFloat(lastMonthRevenue?.dataValues?.total || 0);
        const revenueGrowth = lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 0;

        res.json({
            totalRevenue,
            totalExpenses,
            netProfit,
            totalPayments,
            growth: {
                revenue: parseFloat(revenueGrowth.toFixed(1)),
                expenses: -3.2, // Mock pour l'instant
                profit: parseFloat(((revenueGrowth + 3.2) / 2).toFixed(1)),
                payments: 8.3 // Mock pour l'instant
            }
        });

    } catch (error) {
        console.error('Erreur overview finance:', error);
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

        // Récupérer les revenus des 12 derniers mois
        const monthlyRevenue = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `, { type: sequelize.QueryTypes.SELECT });

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
        const { category = 'all' } = req.query;

        const where = category !== 'all' ? { category } : {};

        const expenses = await Expense.findAll({
            where,
            order: [['date', 'DESC'], ['created_at', 'DESC']]
        });

        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        res.json({
            expenses: expenses.map(exp => ({
                id: exp.id,
                date: exp.date,
                category: exp.category,
                description: exp.description,
                amount: parseFloat(exp.amount),
                paymentMethod: exp.payment_method,
                notes: exp.notes,
                recurring: exp.recurring,
                status: exp.status
            })),
            total
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
        const breakdown = await sequelize.query(`
      SELECT 
        category,
        SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

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
        // Revenus mensuels
        const monthlyRevenue = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month_num,
        SUM(total_amount) / 1000 as revenue
      FROM orders
      WHERE status = 'delivered'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `, { type: sequelize.QueryTypes.SELECT });

        // Dépenses mensuelles
        const monthlyExpenses = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM date) as month_num,
        SUM(amount) / 1000 as expenses
      FROM expenses
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY EXTRACT(MONTH FROM date)
    `, { type: sequelize.QueryTypes.SELECT });

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
        // Pour l'instant, retourner des données mock
        // TODO: Ajouter payment_method dans la table orders
        res.json({
            methods: ['Carte', 'Mobile', 'Cash'],
            percentages: [75, 15, 10],
            amounts: [0, 0, 0] // Sera calculé quand payment_method sera ajouté
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

        // Récupérer les revenus (commandes)
        if (type === 'all' || type === 'revenue') {
            const orders = await Order.findAll({
                where: { status: { [Op.ne]: 'cancelled' } },
                order: [['created_at', 'DESC']],
                limit: parseInt(limit)
            });

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

        // Récupérer les dépenses
        if (type === 'all' || type === 'expense') {
            const expenses = await Expense.findAll({
                order: [['date', 'DESC']],
                limit: parseInt(limit)
            });

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
