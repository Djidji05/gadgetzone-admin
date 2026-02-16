import db, { Order, OrderItem, Product, User } from '../models/index.js';
import sequelize from '../config/database.js';

const debugOrders = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        const storeId = 1;

        try {
            const limit = 10;
            const offset = 0;
            console.log('🚀 Running Query...');
            // Simulating the vendor orders query
            // STEP 1: Get Count and IDs
            // Use findAll with group to get IDs
            const idObjects = await Order.findAll({
                attributes: ['id'],
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        attributes: [], // We don't need item data here, just filtering
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
                    }
                ],
                group: ['Order.id'],
                order: [[db.Sequelize.col('Order.id'), 'DESC']],
                limit: limit,
                offset: offset,
                subQuery: false // We can use false because we are grouping by ID!
            });

            // Get total count (without limit/offset)
            // This is expensive but necessary if we want total pages
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
                    }
                ],
                distinct: true,
                col: 'id'
            });

            const ids = idObjects.map(obj => obj.id);
            console.log('✅ Step 1 IDs found:', ids);
            console.log('✅ Total Count:', totalCount);

            if (ids.length === 0) {
                console.log('No orders found.');
                return;
            }

            // STEP 2: Fetch full details for these IDs
            const orders = await Order.findAll({
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
                                where: { storeId: storeId }, // Still filter items by vendor?
                                // Usually yes, to only show relevant items
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

            console.log('✅ Step 2 Orders loaded:', orders.length);
        } catch (err) {
            console.log('❌ Query FAILED!');
            console.log('Error Message:', err.message);
            if (err.parent) {
                console.log('SQL Error:', err.parent.message);
                console.log('SQL:', err.parent.sql);
            }
        }

    } catch (e) {
        console.error('Fatal:', e);
    } finally {
        await sequelize.close();
    }
};

debugOrders();
