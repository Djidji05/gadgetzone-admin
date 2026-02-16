import { Order } from '../models/index.js';
import { initDatabase, closeConnection } from '../config/database.js';

const countOrders = async () => {
    await initDatabase();
    try {
        const count = await Order.count();
        console.log(`Total Orders: ${count}`);

        // Also check for recent orders used in stats
        const recent = await Order.findAll({ limit: 5 });
        console.log('Recent orders:', JSON.stringify(recent, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await closeConnection();
    }
};

countOrders();
