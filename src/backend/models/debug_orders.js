
import { Sequelize } from 'sequelize';
import { User, Store, Product, Order, OrderItem } from './index.js';

async function debugData() {
    try {
        console.log('--- Stores ---');
        const stores = await Store.findAll();
        stores.forEach(s => console.log(`Store ID: ${s.id}, Name: ${s.name}, UserID: ${s.userId}`));

        console.log('\n--- Products (sample) ---');
        const products = await Product.findAll({ limit: 10 });
        products.forEach(p => console.log(`Product ID: ${p.id}, Name: ${p.name}, StoreID: ${p.storeId}`));

        console.log('\n--- Recent Orders ---');
        const orders = await Order.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }]
        });

        orders.forEach(o => {
            console.log(`Order ID: ${o.id}, UserID: ${o.user_id}, Status: ${o.status}`);
            o.items.forEach(i => {
                console.log(`  - Item ID: ${i.id}, Product ID: ${i.product_id}, Product Name: ${i.product?.name}, Product StoreID: ${i.product?.storeId}`);
            });
        });

    } catch (error) {
        console.error('Error debugging:', error);
    }
}

// Small wrapper to initialize DB connection if needed, though models usually handle it via a shared sequelize instance.
// Assuming models/index.js exports initialized models.
debugData();
