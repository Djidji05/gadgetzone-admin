import express from 'express';
import db, { Store, User, Product, Order, OrderItem, Payout, OrderLog, Deposit, Review } from '../models/index.js';
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
 * GET /api/vendors/:id
 * Get a specific vendor profile (public)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'undefined' || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid ID', message: 'ID de boutique invalide.' });
        }

        const vendor = await Store.findByPk(id, {
            attributes: ['id', 'name', 'description', 'logoUrl', 'bannerUrl', 'status']
        });

        if (!vendor || vendor.status !== 'active') {
            return res.status(404).json({ error: 'Vendor not found', message: 'Boutique introuvable ou inactive.' });
        }

        // Calculate Average Rating
        const reviews = await Review.findAll({
            include: [{
                model: Product,
                as: 'product',
                where: { storeId: id },
                attributes: []
            }],
            attributes: [
                [db.sequelize.fn('AVG', db.sequelize.col('Review.rating')), 'averageRating'],
                [db.sequelize.fn('COUNT', db.sequelize.col('Review.id')), 'reviewCount']
            ],
            raw: true
        });

        // Calculate Shipping Speed (Heuristic/Simulated for now)
        const shippingSpeed = 95 + (parseInt(id) % 5);

        const vendorData = vendor.toJSON();
        vendorData.averageRating = parseFloat(reviews[0]?.averageRating || 4.8).toFixed(1);
        vendorData.reviewCount = parseInt(reviews[0]?.reviewCount || 0);
        vendorData.shippingSpeed = shippingSpeed;

        res.json(vendorData);
    } catch (error) {
        console.error('Fetch vendor detail error:', error);
        res.status(500).json({ error: 'Server error', message: 'Erreur lors de la récupération du profil.' });
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

        // 1. Initialize variables
        let ids = [];
        let totalCount = 0;
        const isDashboardRequest = parseInt(limit) <= 5 && !search && (!status || status === 'all');

        // 2. OPTIMIZED QUERY: FAST PATH (Always try this first if no filters)
        if (!search && (!status || status === 'all')) {
            const recentItems = await OrderItem.findAll({
                attributes: ['order_id'],
                include: [{
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    attributes: [],
                    required: true
                }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit) * 5
            });

            ids = [...new Set(recentItems.map(item => item.order_id))].slice(0, parseInt(limit));
        }

        // 3. COUNT QUERY (Skip for dashboard/small limits to improve performance)
        // Only run count if we are NOT in dashboard mode, OR if fast path found nothing (fallback needed)
        // If Fast Path found IDs and it IS a dashboard request, we skip count (set to ids.length)
        if (isDashboardRequest && ids.length > 0) {
            totalCount = ids.length;
        } else {
            // Standard Count Query (Heavy) - needed for pagination on full list
            totalCount = await Order.count({
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
                        required: search ? false : false,
                    }
                ],
                where: baseWhere,
                distinct: true,
                col: 'id'
            });
        }



        // FALLBACK / STANDARD PATH (Search or Filters active)
        if (ids.length === 0 && (search || (status && status !== 'all'))) {
            // STEP 2: Get IDs for Top-Level Pagination (Existing Logic)
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
                group: ['Order.id', 'user.id'],
                order: [[db.Sequelize.col('Order.id'), 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });
            ids = idObjects.map(obj => obj.id);
        } else if (ids.length === 0 && !search) {
            // Case where optimized query returned nothing (no orders)
        }

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

        // Fetch order with items to check ownership
        const order = await Order.findOne({
            where: { id: orderId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['storeId']
                }]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // SECURITY CHECK: Verify if this vendor owns the products in this order
        // With the new splitting logic, all items should belong to the same vendor.
        // We check if at least one item belongs to this vendor (and ideally all).
        const hasItemsFromStore = order.items.some(item => item.product.storeId === storeId);

        if (!hasItemsFromStore) {
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'Vous ne pouvez pas modifier le statut de cette commande car elle ne contient pas vos produits.'
            });
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

        // Update All Items (Legacy support / Consistency)
        // Since we verified ownership, we can safely update all items for this order 
        // as they should all belong to this vendor now.
        await OrderItem.update(
            { status },
            { where: { order_id: orderId } }
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
 * GET /api/vendors/me/deposits
 * Get all deposits (admin payments) for this vendor
 */
router.get('/me/deposits', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = { storeId };
        if (search) {
            where.reference = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Deposit.findAndCountAll({
            where,
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate total deposits
        const deposits = await Deposit.findAll({ where: { storeId }, attributes: ['amount'] });
        const totalAmount = deposits.reduce((sum, d) => sum + Number(d.amount), 0);

        res.json({
            deposits: rows,
            totalAmount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get deposits error:', error);
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
/**
 * GET /api/vendors/me/transactions
 * Get detailed sale transactions with tax calculations
 */
router.get('/me/transactions', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { page = 1, limit = 20 } = req.query; // Increased limit for mixed stream
        const offset = (page - 1) * limit;

        // 1. Fetch Sales (Order Items)
        const orderItems = await OrderItem.findAll({
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
                    attributes: ['id', 'status', 'created_at'],
                    required: true,
                    include: [{ model: User, as: 'user', attributes: ['name'] }]
                }
            ],
            order: [[Order, 'created_at', 'DESC']],
            limit: parseInt(limit) * 2 // Fetch more to allow merging/sorting
        });

        // 2. Fetch Payouts (Withdrawals)
        const payouts = await Payout.findAll({
            where: { storeId },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit) * 2
        });

        // 3. Fetch Deposits (if any)
        const deposits = await Deposit.findAll({
            where: { storeId },
            order: [['date', 'DESC']],
            limit: parseInt(limit) * 2
        });

        // 4. Normalize and Merge
        const salesTransactions = orderItems.map(item => {
            const gross = Number(item.price) * item.quantity;
            const fee = gross * 0.10;
            const net = gross - fee;
            const order = item.Order || item.order || {};

            return {
                id: `sale_${item.id}`,
                transaction_id: `ORD-${order.id}` || item.order_id,
                type: 'payment', // Front expects 'payment' for sales/orders
                description: `Vente - ${item.product.name} (x${item.quantity})`,
                amount: net, // Net amount credited to wallet
                gross_amount: gross,
                fee: fee,
                status: order.status === 'delivered' ? 'completed' : 'pending',
                created_at: order.created_at || item.created_at,
                partner_name: order.user?.name || 'Client',
                image: item.product.image_url,
                is_credit: true
            };
        });

        const payoutTransactions = payouts.map(p => ({
            id: `payout_${p.id}`,
            transaction_id: `PAYOUT-${p.id}`,
            type: 'cash_out',
            description: `Retrait vers ${p.method}`,
            amount: Number(p.amount),
            status: p.status,
            created_at: p.created_at,
            partner_name: 'GadgetZone',
            is_credit: false
        }));

        const depositTransactions = deposits.map(d => ({
            id: `deposit_${d.id}`,
            transaction_id: d.reference || `DEP-${d.id}`,
            type: 'deposit',
            description: d.note || 'Dépôt administrateur',
            amount: Number(d.amount),
            status: d.status,
            created_at: d.date,
            partner_name: 'Admin',
            is_credit: true
        }));

        // Merge all
        let allTransactions = [...salesTransactions, ...payoutTransactions, ...depositTransactions];

        // Sort by date DESC
        allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Pagination (Simple slice after merge, imperfect for deep pages but sufficient for now)
        const paginatedTransactions = allTransactions.slice(0, parseInt(limit));

        res.json({
            transactions: paginatedTransactions,
            total: allTransactions.length // Approx
        });




    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

export default router;
