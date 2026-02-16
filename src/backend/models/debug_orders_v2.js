
import fs from 'fs';
import { Store, Product, Order, OrderItem } from './index.js';
import sequelize, { closeConnection } from '../config/database.js';

async function debugData() {
    const logStream = fs.createWriteStream('debug_output.txt');
    function log(msg) {
        console.log(msg);
        logStream.write(msg + '\n');
    }

    try {
        log('--- Stores ---');
        const stores = await Store.findAll();
        stores.forEach(s => log(`Store ID: ${s.id}, Name: ${s.name}, UserID: ${s.userId}`));

        log('\n--- Products (All) ---');
        const products = await Product.findAll();
        products.forEach(p => log(`Product ID: ${p.id}, Name: ${p.name}, StoreID: ${p.storeId}`));

        log('\n--- Recent Orders ---');
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
            log(`Order ID: ${o.id}, UserID: ${o.user_id}, Status: ${o.status}`);
            o.items.forEach(i => {
                log(`  - Item ID: ${i.id}, Product ID: ${i.product_id}, Product Name: ${i.product?.name}, Product StoreID: ${i.product?.storeId}`);
            });
        });

    } catch (error) {
        log('Error debugging: ' + error.message);
    } finally {
        logStream.end();
        await closeConnection();
    }
}

debugData();
