import express from 'express';
import db, { Store, User, Product, Order, OrderItem, Payout, OrderLog } from '../models/index.js';
import { authenticateToken, requireAdmin, isSeller, checkStoreActive } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { notifyNewVendorApplication, notifyOrderStatusChange } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * GET /api/vendors
 * Get all active vendors (public)
 */
router.get('/', async (req, res) => {
    try {
        const vendors = await Store.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name', 'description', 'logoUrl', 'bannerUrl'],
            order: [['name', 'ASC']]
        });
        res.json(vendors);
    } catch (error) {
        console.error('Fetch active vendors error:', error);
        res.status(500).json({ error: 'Server error', message: 'Erreur lors de la récupération des vendeurs.' });
    }
});

/**
 * POST /api/vendors/apply
 * Apply to become a vendor
 */
router.post('/apply', authenticateToken, async (req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            businessType,
            taxId,
            address,
            whatsapp,
            productStyle,
            identityData
        } = req.body;
        const userId = req.user.id;

        if (!storeName) return res.status(400).json({ message: 'Le nom de la boutique est requis.' });
        if (!address || !whatsapp) return res.status(400).json({ message: 'Adresse et WhatsApp sont requis.' });

        const existingStore = await Store.findOne({ where: { userId } });
        if (existingStore) {
            return res.status(400).json({
                error: 'Application exists',
                message: 'Vous avez déjà une boutique ou une demande en cours.'
            });
        }

        const existingName = await Store.findOne({ where: { name: storeName } });
        if (existingName) {
            return res.status(409).json({
                error: 'Name taken',
                message: 'Ce nom de boutique est déjà pris.'
            });
        }

        const newStore = await Store.create({
            name: storeName,
            description: storeDescription,
            userId,
            status: 'pending',
            settings: {
                businessType,
                taxId,
                address,
                whatsapp,
                productStyle,
                identityData: identityData
            }
        });

        await notifyNewVendorApplication(newStore, req.user);

        res.status(201).json({
            message: 'Candidature envoyée avec succès ! Votre boutique est en attente de validation.',
            store: newStore
        });

    } catch (error) {
        console.error('Vendor application error:', error);
        res.status(500).json({ error: 'Server error', message: 'Erreur lors de la création de la boutique.' });
    }
});

/**
 * PUT /api/vendors/apply
 * Update existing vendor application
 */
router.put('/apply', authenticateToken, async (req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            businessType,
            taxId,
            address,
            whatsapp,
            productStyle,
            identityData
        } = req.body;
        const userId = req.user.id;

        const store = await Store.findOne({ where: { userId } });
        if (!store) {
            return res.status(404).json({ message: 'Aucune candidature trouvée à mettre à jour.' });
        }

        store.name = storeName || store.name;
        store.description = storeDescription || store.description;

        const newSettings = {
            ...store.settings,
            businessType: businessType || store.settings?.businessType,
            taxId: taxId || store.settings?.taxId,
            address: address || store.settings?.address,
            whatsapp: whatsapp || store.settings?.whatsapp,
            productStyle: productStyle || store.settings?.productStyle,
        };

        if (identityData) {
            newSettings.identityData = identityData;
        }

        store.settings = newSettings;
        store.status = 'pending';

        await store.save();

        res.json({
            message: 'Candidature mise à jour avec succès.',
            store
        });

    } catch (error) {
        console.error('Vendor update error:', error);
        res.status(500).json({ error: 'Server error', message: 'Erreur lors de la mise à jour.' });
    }
});

/**
 * GET /api/vendors/me
 * Get current user's store
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const store = await Store.findOne({ where: { userId: req.user.id } });
        if (!store) {
            return res.status(404).json({ message: 'Aucune boutique trouvée.' });
        }
        res.json(store);
    } catch (error) {
        console.error('Get my store error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * PUT /api/vendors/me
 * Update store settings (name, description, logo)
 */
router.put('/me', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const store = req.store;
        const { name, description, logoUrl, bannerUrl } = req.body;

        await store.update({
            name: name || store.name,
            description: description || store.description,
            logoUrl: logoUrl || store.logoUrl,
            bannerUrl: bannerUrl || store.bannerUrl
        });

        res.json({ message: 'Boutique mise à jour', store });

    } catch (error) {
        console.error('Erreur mise à jour boutique:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/me/products', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = { storeId };
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            products: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get merchant products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/vendors/me/orders
 * Get orders containing products from this vendor
 */
router.get('/me/orders', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { page = 1, limit = 10, search, status } = req.query;
        const offset = (page - 1) * limit;

        const baseWhere = {};
        if (search) {
            baseWhere[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } },
                { '$user.name$': { [Op.like]: `%${search}%` } }
            ];
        }
        if (status && status !== 'all') {
            baseWhere.status = status;
        }

        // STEP 1: Get Total Count (Distinct Orders)
        const totalCount = await Order.count({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            where: { storeId: storeId },
                            required: true
                        }
                    ]
                },
                {
                    model: User,
                    as: 'user',
                    required: search ? false : false, // handled in where below if search
                }
            ],
            where: baseWhere,
            distinct: true,
            col: 'id'
        });

        // STEP 2: Get IDs for Top-Level Pagination
        const idObjects = await Order.findAll({
            attributes: ['id'],
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            where: { storeId: storeId },
                            attributes: [],
                            required: true
                        }
                    ]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: [],
                    required: false
                }
            ],
            where: baseWhere,
            group: ['Order.id', 'user.id'], // added user.id to group for compatibility
            order: [[db.Sequelize.col('Order.id'), 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            subQuery: false
        });

        const ids = idObjects.map(obj => obj.id);

        let finalOrders = [];
        if (ids.length > 0) {
            // STEP 3: Fetch Full Details for Page IDs
            finalOrders = await Order.findAll({
                where: { id: ids },
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        required: true,
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                where: { storeId: storeId },
                                required: true,
                                attributes: ['id', 'name', 'price', 'image_url']
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [[db.Sequelize.col('Order.id'), 'DESC']]
            });
        }

        res.json({
            orders: finalOrders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Erreur récupération commandes vendeur:', error);
        if (error.parent) console.error('SQL Error:', error.parent);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

/**
 * GET /api/vendors/me/orders/:id
 * Get single order details for this vendor
 */
router.get('/me/orders/:id', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            where: { storeId: storeId },
                            required: true,
                            attributes: ['id', 'name', 'price', 'image_url']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrderLog,
                    as: 'logs',
                    include: [
                        {
                            model: User,
                            as: 'actor',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [
                [{ model: OrderLog, as: 'logs' }, 'created_at', 'ASC']
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        res.json(order);

    } catch (error) {
        console.error('Get single order error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/vendors/me/orders/:id
 * Update order status (and all items)
 */
router.patch('/me/orders/:id', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const orderId = req.params.id;
        const { status } = req.body;

        const order = await Order.findOne({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // Update Order Status
        const updateData = {
            status,
            updated_at: new Date()
        };

        const now = new Date();
        if (status === 'confirmed' && !order.confirmed_at) updateData.confirmed_at = now;
        if (status === 'shipped' && !order.shipped_at) updateData.shipped_at = now;
        if (status === 'delivered') {
            updateData.delivered_at = now;
            if (!order.delivered_at) updateData.delivered_at = now;
        }

        await order.update(updateData);

        // CREATE ORDER LOG
        if (status !== order.status) {
            await OrderLog.create({
                order_id: order.id,
                user_id: req.user.id, // Authenticated Vendor
                action: 'status_change',
                old_status: order.status,
                new_status: status,
                details: `Statut mis à jour par le vendeur ${req.store ? req.store.name : ''}`
            });

            // Notify customer
            await notifyOrderStatusChange(order, order.status, status);
        }

        // Update All Items for this order (simplify workflow: all items follow order status)
        // Ideally we would filter by storeId if mixed vendors, but here we assume simpler model or that
        // the vendor "managing" the order updates everything, or at least their items.
        // Let's update items linked to this vendor's products.
        const vendorProducts = await Product.findAll({ where: { storeId }, attributes: ['id'] });
        const productIds = vendorProducts.map(p => p.id);

        await OrderItem.update(
            { status },
            {
                where: {
                    order_id: orderId,
                    product_id: { [Op.in]: productIds }
                }
            }
        );

        // Fetch logs to return
        const updatedLogs = await OrderLog.findAll({
            where: { order_id: orderId },
            include: [{ model: User, as: 'actor', attributes: ['id', 'name'] }],
            order: [['created_at', 'ASC']]
        });

        res.json({ message: 'Statut mis à jour', status, logs: updatedLogs });

    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/vendors/me/stats
 * Get detailed stats for the dashboard
 */
router.get('/me/stats', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;

        // 1. Total Products
        const productsCount = await Product.count({ where: { storeId } });

        // 2. Sales & Orders
        const items = await OrderItem.findAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    required: true,
                    attributes: []
                },
                {
                    model: Order,
                    as: 'Order',
                    attributes: ['status'],
                    required: true
                }
            ],
            attributes: ['price', 'quantity', 'order_id', 'created_at']
        });

        let totalGrossSales = 0;
        let totalNetSales = 0;
        const uniqueOrderIds = new Set();
        const salesByDate = {}; // date -> total

        items.forEach(item => {
            const gross = Number(item.price) * item.quantity;
            const net = gross * 0.90; // 90% goes to vendor

            totalGrossSales += gross;
            if (item.Order?.status === 'delivered') {
                totalNetSales += net;
            }
            uniqueOrderIds.add(item.order_id);

            // Group by date (YYYY-MM-DD)
            const date = new Date(item.created_at || new Date()).toISOString().split('T')[0];
            salesByDate[date] = (salesByDate[date] || 0) + gross;
        });

        // Convert to array for chart
        const chartData = Object.keys(salesByDate).map(date => ({
            date,
            amount: salesByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Recent Sales
        const recentItems = await OrderItem.findAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    required: true,
                    attributes: ['name', 'image_url']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        res.json({
            products: productsCount,
            sales: totalGrossSales,
            netSales: totalNetSales,
            orders: uniqueOrderIds.size,
            chartData: chartData, // New field
            recentSales: recentItems.map(item => ({
                id: item.id,
                productName: item.product.name,
                image: item.product.image_url,
                price: item.price,
                // Date from OrderItem created_at usually exists
                date: item.getDataValue('created_at') || new Date()
            }))
        });

    } catch (error) {
        console.error('Get merchant stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * PATCH /api/vendors/me/orders/:orderId/items/:itemId
 * Update status of a specific Line Item
 */
router.patch('/me/orders/:orderId/items/:itemId', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body; // e.g., 'shipped', 'processing'
        const storeId = req.store.id;

        const orderItem = await OrderItem.findOne({
            where: { id: itemId, order_id: orderId },
            include: [{
                model: Product,
                as: 'product',
                where: { storeId }
            }]
        });

        if (!orderItem) {
            return res.status(404).json({ error: 'Article de commande non trouvé ou non autorisé.' });
        }

        // Update the status
        await orderItem.update({ status });

        res.json({ message: 'Statut mis à jour avec succès', item: orderItem });

    } catch (error) {
        console.error('Update item status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me/payouts', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = { storeId };
        if (search) {
            where.reference = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Payout.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate totals (Unpaginated totals for the whole store)
        const allPayouts = await Payout.findAll({ where: { storeId } });
        const totalPaid = allPayouts
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const pendingValue = allPayouts
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        res.json({
            payouts: rows,
            summary: {
                totalPaid,
                pendingValue
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/vendors/me/payouts
 * Request a withdrawal
 */
router.post('/me/payouts', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { amount, method } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Montant invalide.' });
        }

        // Check if balance is sufficient (Optional but good)
        // We'll calculate balance here to ensure it's correct
        const items = await OrderItem.findAll({
            include: [{
                model: Product,
                as: 'product',
                where: { storeId },
                required: true,
                attributes: []
            }, {
                model: Order,
                as: 'Order',
                where: { status: 'delivered' },
                required: true,
                attributes: []
            }],
            attributes: ['price', 'quantity']
        });

        let totalNetSales = 0;
        items.forEach(item => {
            totalNetSales += (Number(item.price) * item.quantity) * 0.90;
        });

        const allPayouts = await Payout.findAll({ where: { storeId } });
        const totalPaid = allPayouts
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const pendingValue = allPayouts
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const availableBalance = totalNetSales - (totalPaid + pendingValue);

        if (amount > availableBalance) {
            return res.status(400).json({ message: 'Solde insuffisant.' });
        }

        const payout = await Payout.create({
            storeId,
            amount,
            method,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Demande de retrait envoyée avec succès.',
            payout
        });

    } catch (error) {
        console.error('Create payout error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/vendors/me/transactions
 * Get detailed sale transactions with tax calculations
 */
router.get('/me/transactions', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await OrderItem.findAndCountAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    required: true,
                    attributes: ['id', 'name', 'image_url']
                },
                {
                    model: Order,
                    as: 'Order', // Association name from models/index.js (OrderItem.belongsTo(Order))
                    attributes: ['id', 'status', 'created_at', 'updated_at', 'delivered_at'],
                    required: true
                }
            ],
            order: [[{ model: Order, as: 'Order' }, 'created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const transactions = rows.map(item => {
            const gross = Number(item.price) * item.quantity;
            const tax = gross * 0.10; // 10% Admin Commission
            const net = gross - tax;

            return {
                id: item.id,
                orderId: item.order_id,
                productName: item.product.name,
                image: item.product.image_url,
                gross,
                tax,
                net,
                quantity: item.quantity,
                unitPrice: item.price,
                status: item.Order.status,
                orderDate: item.Order.created_at,
                // Assume delivery date is updatedAt if status is delivered
                deliveryDate: item.Order.status === 'delivered' ? (item.Order.delivered_at || item.Order.updated_at) : null
            };
        });

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

export default router;
