import { sequelize, User, Store, Product, Order, OrderItem, Category, Dispute, Cart, CartItem } from '../models/index.js';

async function scanIntegrity() {
    try {
        console.log('🔍 Starting Deep Database Integrity Scan...\n');

        // 1. Orphaned OrderItems
        const orphanedItems = await OrderItem.findAll({
            include: [{
                model: Order,
                required: false
            }],
            where: sequelize.where(sequelize.col('Order.id'), 'IS', null)
        });
        console.log(`- Orphaned OrderItems: ${orphanedItems.length}`);

        // 2. Stores without Users
        const orphanedStores = await Store.findAll({
            include: [{
                model: User,
                as: 'owner',
                required: false
            }],
            where: sequelize.where(sequelize.col('owner.id'), 'IS', null)
        });
        console.log(`- Stores without Owners: ${orphanedStores.length}`);

        // 3. Products without Stores
        const productsWithoutStore = await Product.findAll({
            where: {
                storeId: null
            }
        });
        console.log(`- Products without Store ID: ${productsWithoutStore.length}`);

        // 4. Broken Cart Items
        const orphanedCartItems = await CartItem.findAll({
            include: [{
                model: Cart,
                required: false
            }],
            where: sequelize.where(sequelize.col('Cart.id'), 'IS', null)
        });
        console.log(`- Orphaned CartItems: ${orphanedCartItems.length}`);

        // 5. Enum validation in memory for key models
        console.log('\n- Validating Enums for Disputes and Stores...');
        const disputes = await Dispute.findAll();
        const validDisputeReasons = ['not_received', 'damaged', 'wrong_item', 'other'];
        const invalidDisputes = disputes.filter(d => !validDisputeReasons.includes(d.reason));
        console.log(`  - Invalid Dispute Reasons: ${invalidDisputes.length}`);

        const stores = await Store.findAll();
        const validStoreStatuses = ['pending', 'active', 'suspended', 'closed'];
        const invalidStores = stores.filter(s => !validStoreStatuses.includes(s.status));
        console.log(`  - Invalid Store Statuses: ${invalidStores.length}`);

        console.log('\n✅ Scan Complete.');

    } catch (error) {
        console.error('❌ Integrity Scan Error:', error);
    } finally {
        await sequelize.close();
    }
}

scanIntegrity();
