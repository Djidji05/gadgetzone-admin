import OrderService from '../services/OrderService.js';
import { User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class OrderController {
    constructor() {
        this.orderService = new OrderService();
    }

    getMyOrders = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const orders = await this.orderService.getMyOrders(req.user.id, {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });
            res.json(orders.rows);
        } catch (error) {
            console.error('❌ Controller Error [getMyOrders]:', error);
            res.status(500).json({ error: 'Failed to fetch your orders' });
        }
    };

    getAllOrders = async (req, res) => {
        try {
            // 🔒 DÉFENSE EN PROFONDEUR : Vérifier le rôle même si le middleware est présent
            if (req.user.role !== 'admin' && req.user.role !== 'gestionnaire') {
                return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
            }

            const { page = 1, limit = 10, status } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                include: [
                    { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
                ],
                order: [['created_at', 'DESC']],
                where: status ? { status } : { status: { [Op.ne]: 'payment_pending' } } // 🔒 Filtrer les brouillons
            };

            const result = await this.orderService.getAllPaginated(options);
            res.json({
                orders: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.count,
                    totalPages: Math.ceil(result.count / limit)
                }
            });
        } catch (error) {
            console.error('❌ Controller Error [getAllOrders]:', error);
            res.status(500).json({ error: 'Failed to fetch orders', message: error.message, stack: error.stack });
        }
    };

    getOrderById = async (req, res) => {
        try {
            const order = await this.orderService.getOrderDetails(req.params.id);
            if (!order) return res.status(404).json({ error: 'Order not found' });

            // 🔒 PROTECTION IDOR : Vérifier la propriété ou le rôle admin
            if (order.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied: You do not have permission to view this order.' });
            }

            res.json(order);
        } catch (error) {
            console.error('❌ Controller Error [getOrderById]:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    };

    createOrder = async (req, res) => {
        try {
            console.log('📦 Create Order Request:', JSON.stringify(req.body, null, 2));
            
            // 🛡️ SÉCURISATION : Forcer l'ID utilisateur à celui de la session pour éviter l'usurpation
            const orderData = {
                ...req.body,
                user_id: req.user.id
            };

            const order = await this.orderService.createOrder(orderData);
            res.status(201).json(order);
        } catch (error) {
            console.error('❌ Controller Error [createOrder]:', error); // Log full error object (includes stack)
            res.status(400).json({ error: error.message, stack: error.stack });
        }

    };

    updateOrder = async (req, res) => {
        try {
            const { status } = req.body;
            const updated = await this.orderService.updateStatus(req.params.id, status, req.user.id);
            res.json(updated);
        } catch (error) {
            console.error('❌ Controller Error [updateOrder]:', error);
            res.status(400).json({ error: error.message });
        }
    };

    cancelOrder = async (req, res) => {
        try {
            const updated = await this.orderService.cancelOrder(req.params.id, req.user.id, req.user.role);
            res.json(updated);
        } catch (error) {
            console.error('❌ Controller Error [cancelOrder]:', error);
            res.status(400).json({ error: error.message });
        }
    };

    deleteOrder = async (req, res) => {
        try {
            // 🔒 DÉFENSE EN PROFONDEUR
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Action réservée aux administrateurs.' });
            }

            await this.orderService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('❌ Controller Error [deleteOrder]:', error);
            res.status(500).json({ error: 'Failed to delete order' });
        }
    };
}

export default new OrderController();
