import express from 'express';
import db, { Store, User, Product, Order, OrderItem, Payout, OrderLog, Deposit, Review, Message, Conversation, Category, Boost, ForumPost, ForumComment, ForumLike, StoreFollower } from '../models/index.js';
import PaymentService from '../services/PaymentService.js';
import { authenticateToken, requireAdmin, isSeller, checkStoreActive, optionalAuth } from '../middleware/auth.js';

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
            order: [['name', 'ASC']],
            limit: 50, // ⚡ Sécurité: ne pas charger tous les vendeurs en une fois
            raw: true
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
            return res.status(200).json(null);
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
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid ID', message: 'Identifiant de boutique invalide.' });
        }

        let vendor;
        if (!isNaN(parseInt(id))) {
            vendor = await Store.findByPk(id, {
                attributes: ['id', 'name', 'description', 'logoUrl', 'bannerUrl', 'status', 'follower_count', 'trust_score']
            });
        } else {
            // Recherche par nom normalisé/exact
            vendor = await Store.findOne({
                where: { name: id },
                attributes: ['id', 'name', 'description', 'logoUrl', 'bannerUrl', 'status', 'follower_count', 'trust_score']
            });
        }

        if (!vendor || vendor.status !== 'active') {
            return res.status(404).json({ error: 'Vendor not found', message: 'Boutique introuvable ou inactive.' });
        }

        const storeIdNum = vendor.id;

        // Calculate Average Rating
        const reviews = await Review.findAll({
            include: [{
                model: Product,
                as: 'product',
                where: { storeId: storeIdNum },
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

        // Is following check (if user logged in)
        let isFollowing = false;
        if (req.user) {
            const follow = await StoreFollower.findOne({
                where: { storeId: storeIdNum, userId: req.user.id }
            });
            isFollowing = !!follow;
        }

        vendorData.isFollowing = isFollowing;

        res.json(vendorData);
    } catch (error) {
        console.error('Fetch vendor detail error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

/**
 * POST /api/vendors/:id/follow
 * Follow a store
 */
router.post('/:id/follow', authenticateToken, async (req, res) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;

        const store = await Store.findByPk(storeId);
        if (!store) return res.status(404).json({ message: 'Boutique introuvable.' });

        const [follow, created] = await StoreFollower.findOrCreate({
            where: { storeId, userId }
        });

        if (created) {
            await store.increment('follower_count');
        }

        res.json({ 
            message: 'Vous suivez maintenant cette boutique.', 
            isFollowing: true,
            follower_count: store.follower_count + (created ? 1 : 0)
        });
    } catch (error) {
        console.error('Follow store error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * DELETE /api/vendors/:id/follow
 * Unfollow a store
 */
router.delete('/:id/follow', authenticateToken, async (req, res) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;

        const store = await Store.findByPk(storeId);
        if (!store) return res.status(404).json({ message: 'Boutique introuvable.' });

        const deleted = await StoreFollower.destroy({
            where: { storeId, userId }
        });

        if (deleted > 0) {
            await store.decrement('follower_count');
        }

        res.json({ 
            message: 'Vous ne suivez plus cette boutique.', 
            isFollowing: false,
            follower_count: Math.max(0, store.follower_count - (deleted > 0 ? 1 : 0))
        });
    } catch (error) {
        console.error('Unfollow store error:', error);
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
        const { 
            name, description, logoUrl, bannerUrl,
            phone, address, facebook, instagram,
            moncashNumber, natcashNumber 
        } = req.body;

        await store.update({
            name: name !== undefined ? name : store.name,
            description: description !== undefined ? description : store.description,
            logoUrl: logoUrl !== undefined ? logoUrl : store.logoUrl,
            bannerUrl: bannerUrl !== undefined ? bannerUrl : store.bannerUrl,
            phone: phone !== undefined ? phone : store.phone,
            address: address !== undefined ? address : store.address,
            facebook: facebook !== undefined ? facebook : store.facebook,
            instagram: instagram !== undefined ? instagram : store.instagram,
            moncashNumber: moncashNumber !== undefined ? moncashNumber : store.moncashNumber,
            natcashNumber: natcashNumber !== undefined ? natcashNumber : store.natcashNumber,
            latitude: req.body.latitude !== undefined ? req.body.latitude : store.latitude,
            longitude: req.body.longitude !== undefined ? req.body.longitude : store.longitude
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

        console.log(`[DEBUG] Fetching products for store ${storeId} (Page: ${page}, Limit: ${limit})...`);
        const startTime = Date.now();

        const { count, rows } = await Product.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const duration = Date.now() - startTime;
        console.log(`[DEBUG] Products fetched in ${duration}ms. Found: ${rows.length}, Total: ${count}`);

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
 * GET /api/vendors/me/summary
 * Get quick stats for notifications (pending orders, unread messages)
 */
router.get('/me/summary', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.store.id;

        const [pendingOrdersCount, unreadMessagesCount] = await Promise.all([
            // 1. Pending Orders Count (where vendor has products)
            OrderItem.count({
                distinct: true,
                col: 'order_id',
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
                        where: { status: { [Op.notIn]: ['payment_pending', 'cancelled'] } },
                        required: true,
                        attributes: []
                    }
                ]
            }),
            // 2. Unread Messages Count
            Message.count({
                where: {
                    isRead: false,
                    senderId: { [Op.ne]: userId }
                },
                include: [{
                    model: Conversation,
                    required: true,
                    where: {
                        [Op.or]: [
                            { participant1Id: userId },
                            { participant2Id: userId }
                        ]
                    }
                }]
            })
        ]);

        res.json({
            pendingOrdersCount,
            unreadMessagesCount
        });
    } catch (error) {
        console.error('Get vendor summary error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
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

        // 1. GET ALL ORDER IDS for this vendor (The "Vendor Filter")
        // This is the most robust way to filter by storeId across joins in PostgreSQL
        const orderIdsObjects = await OrderItem.findAll({
            attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('order_id')), 'order_id']],
            include: [{
                model: Product,
                as: 'product',
                where: { storeId },
                attributes: []
            }],
            raw: true
        });
        const vendorOrderIds = orderIdsObjects.map(o => o.order_id).filter(Boolean);

        if (vendorOrderIds.length === 0) {
            return res.json({
                orders: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: 0
                }
            });
        }

        const baseWhere = {
            id: { [Op.in]: vendorOrderIds }
        };

        if (search) {
            const isNumeric = !isNaN(search);
            if (isNumeric) {
                baseWhere.id = { [Op.and]: [baseWhere.id, parseInt(search)] };
            } else {
                baseWhere['$user.name$'] = { [Op.like]: `%${search}%` };
            }
        }
        if (status && status !== 'all') {
            baseWhere.status = status;
        } else {
            baseWhere.status = { [Op.ne]: 'payment_pending' }; // 🔒 Cacher les brouillons non payés par défaut
        }

        // 2. COUNT QUERY
        const isDashboardRequest = parseInt(limit) <= 5 && !search && (!status || status === 'all');
        let totalCount = 0;

        if (isDashboardRequest) {
            totalCount = Math.min(vendorOrderIds.length, 5);
        } else {
            totalCount = await Order.count({
                distinct: true,
                include: search && isNaN(search) ? [{ model: User, as: 'user', attributes: [] }] : [],
                where: baseWhere
            });
        }

        // 3. FETCH DATA (Standard query now)
        const orders = await Order.findAll({
            where: baseWhere,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    required: true,
                    include: [{
                        model: Product,
                        as: 'product',
                        where: { storeId },
                        required: true,
                        attributes: ['id', 'name', 'price', 'image_url'],
                        include: [{
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name', 'commission_rate']
                        }]
                    }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: (search && isNaN(search)) ? true : false
                }
            ],
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            subQuery: false
        });

        res.json({
            orders,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
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
                            attributes: ['id', 'name', 'price', 'image_url'],
                            include: [{
                                model: Category,
                                as: 'category',
                                attributes: ['id', 'name', 'commission_rate']
                            }]
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
        const userId = req.user.id;
        const storeId = req.store.id;
        const { period = '30d' } = req.query;
        const defaultCommissionRate = parseFloat(req.store.commission_rate || 3);
        let interval = '30 days';
        let truncation = 'day';

        if (period === '7d') {
            interval = '7 days';
        } else if (period === '12m') {
            interval = '12 months';
            truncation = 'month';
        }

        const results = await Promise.all([
            // 1. Total Products
            Product.count({ where: { storeId } }),

            // 2. Gross Sales & Total Orders (Filtered by period)
            OrderItem.findOne({
                include: [{
                    model: Product,
                    as: 'product',
                    where: { storeId },
                    attributes: [],
                    required: true
                }],
                where: {
                    created_at: { [Op.gte]: db.sequelize.literal(`NOW() - INTERVAL '${interval}'`) }
                },
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.literal('"OrderItem"."price" * "OrderItem"."quantity"')), 'totalGross'],
                    [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('OrderItem.order_id'))), 'totalOrders']
                ],
                raw: true
            }),

            // 3. Optimized Net Sales (Filtered by period)
            db.sequelize.query(`
                SELECT COALESCE(SUM((oi.price * oi.quantity) * (1 - COALESCE(c.commission_rate, :rate) / 100.0)), 0) as total
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                JOIN orders o ON oi.order_id = o.id
                WHERE p."storeId" = :storeId AND o.status = 'delivered'
                AND oi.created_at >= NOW() - INTERVAL '${interval}'
            `, { 
                replacements: { storeId, rate: defaultCommissionRate }, 
                type: 'SELECT' 
            }),

            // 4. Optimized Pending Net Sales
            db.sequelize.query(`
                SELECT COALESCE(SUM((oi.price * oi.quantity) * (1 - COALESCE(c.commission_rate, :rate) / 100.0)), 0) as total
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                JOIN orders o ON oi.order_id = o.id
                WHERE p."storeId" = :storeId 
                AND o.status IN ('pending', 'shipped', 'confirmed', 'processing')
            `, { 
                replacements: { storeId, rate: defaultCommissionRate }, 
                type: 'SELECT' 
            }),

            // 5. Sales by date for chart (Dynamic interval & grouping)
            db.sequelize.query(`
                SELECT 
                    (DATE_TRUNC('${truncation}', oi.created_at))::TEXT as date,
                    COALESCE(SUM((oi.price * oi.quantity) * (1 - COALESCE(c.commission_rate, :rate) / 100.0)), 0) as amount
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                JOIN orders o ON oi.order_id = o.id
                WHERE p."storeId" = :storeId 
                AND oi.created_at >= NOW() - INTERVAL '${interval}'
                GROUP BY DATE_TRUNC('${truncation}', oi.created_at)
                ORDER BY DATE_TRUNC('${truncation}', oi.created_at) ASC
            `, { 
                replacements: { storeId, rate: defaultCommissionRate }, 
                type: 'SELECT' 
            }),

            // 6. Sales List (Filtered by period)
            OrderItem.findAll({
                include: [
                    {
                        model: Product,
                        as: 'product',
                        where: { storeId },
                        required: true,
                        attributes: ['name', 'image_url'],
                        include: [{
                            model: Category,
                            as: 'category',
                            attributes: ['commission_rate']
                        }]
                    }
                ],
                where: {
                    created_at: { [Op.gte]: db.sequelize.literal(`NOW() - INTERVAL '${interval}'`) }
                },
                order: [['created_at', 'DESC']],
                limit: 500
            }),

            // 7. Deposits (Admin Credits)
            Deposit.findOne({
                where: { storeId, status: 'completed' },
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'totalDeposits']
                ],
                raw: true
            }),

            // 8. Order Success Ratio (Health)
            Order.findAll({
                where: { store_id: storeId, status: { [Op.in]: ['delivered', 'cancelled'] } },
                attributes: ['status'],
                raw: true
            }),

            // 9. Unread Messages for Vendor
            Message.count({
                include: [{
                    model: Conversation,
                    where: {
                        [Op.or]: [
                            { participant1Id: userId },
                            { participant2Id: userId }
                        ]
                    },
                    required: true
                }],
                where: {
                    senderId: { [Op.ne]: userId },
                    isRead: false
                }
            })
        ]);

        const productsCount = results[0];
        const totalStats = results[1];
        const netStatsResult = results[2];
        const pendingStatsResult = results[3];
        const salesByDateResults = results[4];
        const recentItems = results[5];
        const depositStats = results[6];
        const healthOrders = results[7];
        const unreadMessagesCount = results[8];

        const totalGross = parseFloat(totalStats?.totalGross || 0);
        const totalNet = parseFloat(netStatsResult[0]?.total || 0);
        const totalPendingNet = parseFloat(pendingStatsResult[0]?.total || 0);
        const totalDeposits = parseFloat(depositStats?.totalDeposits || 0);
        const totalOrdersCount = parseInt(totalStats?.totalOrders || 0);

        // Calculate Health Score
        let healthScoreValue = 100;
        if (healthOrders && healthOrders.length > 0) {
            const delivered = healthOrders.filter(o => o.status === 'delivered').length;
            healthScoreValue = Math.round((delivered / healthOrders.length) * 100);
        }

        // Conversion Rate (Ratio of customers to products or orders to views)
        // Since we don't track views, we'll use a dynamic estimate relative to order volume
        const conversionRateValue = totalOrdersCount > 0 ? Math.min(Math.round((totalOrdersCount / (productsCount || 1)) * 5), 100) : 0;

        res.json({
            products: productsCount,
            sales: totalGross,
            netSales: totalNet,
            pendingNetSales: totalPendingNet,
            totalDeposits,
            orders: totalOrdersCount,
            healthScore: healthScoreValue,
            unreadMessagesCount,
            conversionRate: conversionRateValue,
            chartData: salesByDateResults,
            recentSales: recentItems.map(item => {
                const categoryRate = item.product?.category?.commission_rate;
                const effectiveRate = categoryRate !== undefined ? parseFloat(categoryRate) : defaultCommissionRate;
                const grossPrice = parseFloat(item.price);
                const netPrice = grossPrice * (1 - effectiveRate / 100);

                return {
                    id: item.id,
                    productName: item.product.name,
                    image: item.product.image_url,
                    grossPrice: grossPrice,
                    netPrice: netPrice,
                    commissionRate: effectiveRate,
                    date: item.created_at
                };
            })
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

        // Calculate totals via optimized SQL aggregations (⚡ Don't load ALL payout objects)
        const [summaryResult] = await Promise.all([
            Payout.findOne({
                where: { storeId },
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.literal('CASE WHEN status = \'completed\' THEN amount ELSE 0 END')), 'totalPaid'],
                    [db.sequelize.fn('SUM', db.sequelize.literal('CASE WHEN status = \'pending\' THEN amount ELSE 0 END')), 'pendingValue']
                ],
                raw: true
            })
        ]);

        res.json({
            payouts: rows,
            summary: {
                totalPaid: parseFloat(summaryResult?.totalPaid || 0),
                pendingValue: parseFloat(summaryResult?.pendingValue || 0)
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

        // Calculate total deposits via SQL aggregation (⚡ Memory efficient)
        const totals = await Deposit.findOne({
            where: { storeId, status: 'completed' },
            attributes: [[db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']],
            raw: true
        });
        const totalAmount = parseFloat(totals?.total || 0);

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
        const { amount, method, phone, accountName } = req.body;

        console.log(`[Payout] New request from Store #${storeId}:`, { amount, method, phone, accountName });

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Montant de retrait invalide.' });
        }
        if (!phone) {
            return res.status(400).json({ message: 'Le numéro de retrait est requis.' });
        }
        if (!accountName) {
            return res.status(400).json({ message: 'Le nom du compte est requis.' });
        }

        // Save as default if none exists
        const storeRecord = await Store.findByPk(storeId);
        if (!storeRecord) {
            return res.status(404).json({ message: 'Boutique non trouvée.' });
        }

        let settings = storeRecord.settings || {};
        if (!settings.payoutPhone) {
            settings.payoutPhone = phone;
            settings.payoutName = accountName;
            storeRecord.settings = settings;
            storeRecord.changed('settings', true);
            await storeRecord.save();
        }

        // 1. Optimized Balance Calculation (Direct SQL)
        const defaultCommissionRate = parseFloat(req.store.commission_rate || 3);
        
        const [netSalesResult, depositStats, payoutStats] = await Promise.all([
          // Net Sales from delivered orders
          db.sequelize.query(`
              SELECT COALESCE(SUM((oi.price * oi.quantity) * (1 - COALESCE(c.commission_rate, :rate) / 100.0)), 0) as total
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              LEFT JOIN categories c ON p.category_id = c.id
              JOIN orders o ON oi.order_id = o.id
              WHERE p."storeId" = :storeId AND o.status = 'delivered'
          `, { replacements: { storeId, rate: defaultCommissionRate }, type: 'SELECT' }),

          // Credits from logic deposits
          Deposit.findOne({
              where: { storeId, status: 'completed' },
              attributes: [[db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']],
              raw: true
          }),

          // Debits from Payouts (Paid + Currently Pending)
          Payout.findOne({
              where: { storeId, status: { [Op.in]: ['completed', 'pending'] } },
              attributes: [[db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']],
              raw: true
          })
        ]);

        const totalNetSales = parseFloat(netSalesResult[0]?.total || 0);
        const totalDeposits = parseFloat(depositStats?.total || 0);
        const totalDebits = parseFloat(payoutStats?.total || 0);
        
        const totalCredits = totalNetSales + totalDeposits;
        const availableBalance = Math.round((totalCredits - totalDebits) * 100) / 100;

        console.log(`[Payout] Store #${storeId} - Credits: ${totalCredits}, Debits: ${totalDebits}, Available: ${availableBalance}, Requested: ${amount}`);

        if (amount > availableBalance) {
            return res.status(400).json({
                message: `Solde insuffisant. Votre solde disponible est de ${availableBalance} G.`,
                available: availableBalance
            });
        }

        const payout = await Payout.create({
            storeId,
            amount: Math.round(amount * 100) / 100,
            method,
            status: 'pending', // Require Admin Approval
            adminNote: `En attente d'approbation. ${method} envoyé au ${phone} (${accountName})`
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
        const { page = 1, limit = 20 } = req.query;
        const [orderItems, payouts, deposits] = await Promise.all([
            // 1. Fetch Sales (Order Items)
            OrderItem.findAll({
                include: [
                    {
                        model: Product,
                        as: 'product',
                        where: { storeId },
                        attributes: ['id', 'name', 'image_url']
                    },
                    { 
                        model: Order, 
                        attributes: ['id', 'status', 'created_at'], 
                        include: [{ model: User, as: 'user', attributes: ['name'] }] 
                    }
                ],
                attributes: ['id', 'price', 'quantity', 'created_at', 'order_id'],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit) * 2, // Suffisant pour le merge paginé
                raw: true,
                nest: true
            }),
            // 2. Fetch Payouts (Withdrawals)
            Payout.findAll({
                where: { storeId },
                attributes: ['id', 'amount', 'method', 'status', 'created_at'],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit) * 2,
                raw: true
            }),
            // 3. Fetch Deposits
            Deposit.findAll({
                where: { storeId },
                attributes: ['id', 'amount', 'note', 'status', 'date', 'reference'],
                order: [['date', 'DESC']],
                limit: parseInt(limit) * 2,
                raw: true
            })
        ]);

        // 4. Normalize and Merge
        const defaultCommissionRate = parseFloat(req.store.commission_rate || 3);
        const salesTransactions = orderItems.map(item => {
            const categoryRate = item.product?.category?.commission_rate;
            const effectiveRate = categoryRate !== undefined ? parseFloat(categoryRate) : defaultCommissionRate;

            const gross = Number(item.price) * item.quantity;
            const fee = gross * (effectiveRate / 100);
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
            partner_name: 'HTFasil',
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

/**
 * GET /api/vendors/me/products
 * Lister les produits du vendeur (pour sélection boost)
 */
router.get('/me/products', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const products = await Product.findAll({
            where: { storeId, status: 'active' },
            attributes: ['id', 'name', 'image_url', 'price'],
            order: [['created_at', 'DESC']],
            limit: 100, // ⚡ Sécurité: ne pas charger tout le catalogue sans pagination
            raw: true
        });
        res.json(products);
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/vendors/me/boost
 * Proposer un Boost pour un produit via MonCash
 */
router.post('/me/boost', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const { productId, packageName } = req.body;
        const storeId = req.store.id;

        const product = await Product.findOne({ where: { id: productId, storeId } });
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé.' });
        }

        const packages = {
            'Essentiel': { price: 250, duration: 3 },
            'Standard': { price: 500, duration: 7 },
            'Premium': { price: 1500, duration: 30 }
        };

        const pkg = packages[packageName];
        if (!pkg) return res.status(400).json({ error: 'Pack invalide.' });

        const boost = await Boost.create({
            storeId,
            productId,
            package_name: packageName,
            amount: pkg.price,
            duration_days: pkg.duration,
            status: 'pending'
        });

        const paymentService = new PaymentService();
        const returnUrl = `http://localhost:5173/seller/boost?success=true`;
        const redirectUrl = await paymentService.initiateMonCashPayment(`BOOST_${boost.id}`, pkg.price, returnUrl);


        res.json({ redirectUrl, boostId: boost.id });

    } catch (error) {
        console.error('Boost creation error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du boost', message: error.message });
    }
});

/**
 * GET /api/vendors/me/boosts
 * Lister les boosts de la boutique
 */
router.get('/me/boosts', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const boosts = await Boost.findAll({
            where: { storeId },
            include: [{ model: Product, as: 'product', attributes: ['name', 'image_url'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(boosts);
    } catch (error) {
        console.error('Get boosts error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// --- COMMUNITY / FORUM ROUTES ---

/**
 * GET /api/vendors/me/community/stats
 * Statistiques de la communauté
 */
router.get('/me/community/stats', authenticateToken, isSeller, async (req, res) => {
    try {
        const totalMembers = await Store.count({ where: { status: 'active' } });
        // Estimate active members (e.g., those who logged in or had sales recently)
        const activeMembers = await Store.count({
            where: { status: 'active' },
            // In a real app, join with User or Order to check recent activity
        });
        const experts = await Store.count({ where: { status: 'active' } }); // Example logic

        res.json({
            totalMembers: totalMembers > 1000 ? (totalMembers / 1000).toFixed(1) + 'k' : totalMembers,
            activeMembers: Math.floor(activeMembers * 0.4) || 1, // Simulated for now
            experts: Math.floor(experts * 0.1) || 0
        });
    } catch (error) {
        console.error('Community stats error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/vendors/me/community/posts
 * Liste des discussions
 */
router.get('/me/community/posts', authenticateToken, isSeller, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const posts = await ForumPost.findAll({
            where: { status: 'active' },
            include: [
                { model: Store, as: 'author', attributes: ['name', 'logoUrl'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Format for frontend
        const formatted = posts.map(p => ({
            id: p.id,
            author: p.author?.name || 'Vendeur Anonyme',
            avatar: p.author?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author?.name || 'V')}&background=random`,
            time: p.created_at, // Frontend will format "Il y a X temps"
            title: p.title,
            content: p.content,
            comments: p.comments_count,
            likes: p.likes_count,
            hasLiked: false // Ideally, join with ForumLike to check if req.store.id liked it
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Community posts error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/vendors/me/community/posts/:id/comments
 * Détails d'un post et ses commentaires
 */
router.get('/me/community/posts/:id/comments', authenticateToken, isSeller, async (req, res) => {
    try {
        const post = await ForumPost.findOne({
            where: { id: req.params.id, status: 'active' },
            include: [{ model: Store, as: 'author', attributes: ['name', 'logoUrl'] }]
        });

        if (!post) return res.status(404).json({ error: 'Post introuvable' });

        const comments = await ForumComment.findAll({
            where: { postId: post.id },
            include: [{ model: Store, as: 'author', attributes: ['name', 'logoUrl'] }],
            order: [['created_at', 'ASC']]
        });

        res.json({
            post: {
                ...post.toJSON(),
                authorName: post.author?.name,
                authorAvatar: post.author?.logoUrl
            },
            comments: comments.map(c => ({
                id: c.id,
                content: c.content,
                author: c.author?.name || 'Vendeur',
                avatar: c.author?.logoUrl,
                time: c.created_at
            }))
        });
    } catch (error) {
        console.error('Post details error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/vendors/me/community/posts
 * Créer un nouveau sujet
 */
router.post('/me/community/posts', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const { title, content } = req.body;

        if (!title || !content) return res.status(400).json({ error: 'Titre et contenu obligatoires' });

        const post = await ForumPost.create({
            storeId,
            title,
            content,
            status: 'active'
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/vendors/me/community/posts/:id/comments
 * Ajouter un commentaire
 */
router.post('/me/community/posts/:id/comments', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const postId = req.params.id;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: 'Contenu obligatoire' });

        const post = await ForumPost.findByPk(postId);
        if (!post || post.status !== 'active') return res.status(404).json({ error: 'Sujet introuvable' });

        const comment = await ForumComment.create({
            storeId,
            postId,
            content
        });

        await post.increment('comments_count');

        res.status(201).json(comment);
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/vendors/me/community/posts/:id/like
 * Liker / Unliker un post
 */
router.post('/me/community/posts/:id/like', authenticateToken, isSeller, checkStoreActive, async (req, res) => {
    try {
        const storeId = req.store.id;
        const postId = req.params.id;

        const post = await ForumPost.findByPk(postId);
        if (!post) return res.status(404).json({ error: 'Sujet introuvable' });

        const existingLike = await ForumLike.findOne({ where: { storeId, postId } });

        if (existingLike) {
            await existingLike.destroy();
            await post.decrement('likes_count');
            res.json({ liked: false, likes_count: post.likes_count - 1 });
        } else {
            await ForumLike.create({ storeId, postId });
            await post.increment('likes_count');
            res.json({ liked: true, likes_count: post.likes_count + 1 });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
