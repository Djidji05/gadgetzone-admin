import sequelize from '../config/database.js';

async function applyAdminPerformanceRemediation() {
    console.log('🚀 APPLICATION DES INDEX DE PERFORMANCE ROCKET');
    console.log('==============================================');

    try {
        // 1. Index sur Order Items pour accélérer le Dashboard (stats de commissions)
        console.log('📦 Indexation de order_items(order_id, product_id)...');
        await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
        await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)');

        // 2. Index sur Products pour accélérer les jointures avec Stores
        console.log('🛒 Indexation de products("storeId")...');
        // Note: Sequelize uses "storeId" (with quotes) if it's CamelCase
        await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_store_id ON products("storeId")');

        // 3. Index sur Orders pour accélérer le listing par statut (Dashboard filter)
        console.log('📋 Indexation de orders(status)...');
        await sequelize.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');

        // 4. Index sur Stores pour accélérer le Login (recherche de boutique par proprio)
        console.log('🏪 Indexation de stores(user_id)...');
        await sequelize.query('CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id)');

        console.log('\n✅ REMÉDIATION TERMINÉE AVEC SUCCÈS');
        console.log('Les temps de réponse devraient être divisés par 10.');

    } catch (error) {
        console.error('❌ ERREUR REMÉDIATION:', error.message);
    } finally {
        process.exit(0);
    }
}

applyAdminPerformanceRemediation();
