import sequelize from '../config/database.js';

async function runAdminPerformanceAudit() {
    console.log('🚀 DÉMARRAGE DE L\'AUDIT DE PERFORMANCE ADMIN');
    console.log('============================================');

    const results = [];

    try {
        // --- TEST 1: Calcul des Statistiques Panorama (Dashboard) ---
        console.log('\n📊 TEST 1: Benchmark du calcul des statistiques Dashboard...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // 30 derniers jours

        const startSql = Date.now();
        const [stats] = await sequelize.query(`
            SELECT 
                COALESCE(SUM(oi.price * oi.quantity * s.commission_rate / 100), 0) as total_revenue,
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT oi.product_id) as products_involved
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            JOIN stores s ON p."storeId" = s.id
            WHERE o.status = 'delivered' AND o.created_at >= :startDate
        `, { replacements: { startDate }, type: sequelize.QueryTypes.SELECT });
        
        const durationSql = Date.now() - startSql;
        console.log(`⏱️ Temps de calcul (SQL): ${durationSql}ms`);
        results.push({ metric: 'Dashboard Stats (SQL)', value: `${durationSql}ms`, status: durationSql < 200 ? '🚀 Excellent' : '🟢 OK' });

        // --- TEST 2: Listing Global des Commandes ---
        console.log('\n📦 TEST 2: Benchmark du listing global des commandes...');
        const startOrders = Date.now();
        await sequelize.query(`
            SELECT o.*, u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 50
        `);
        const durationOrders = Date.now() - startOrders;
        console.log(`⏱️ Temps de listing: ${durationOrders}ms`);
        results.push({ metric: 'Order Listing (Admin)', value: `${durationOrders}ms`, status: durationOrders < 100 ? '🚀 Excellent' : '🟢 OK' });

        // --- TEST 3: Audit des Index Clés ---
        console.log('\n🗄️ TEST 3: Vérification des index de performance admin...');
        const [indexes] = await sequelize.query(`
            SELECT indexname FROM pg_indexes 
            WHERE tablename IN ('order_items', 'orders', 'products', 'stores')
        `);

        const indexNames = indexes.map(i => i.indexname);
        const checks = [
            { name: 'order_items_order_id_idx', table: 'order_items' },
            { name: 'products_storeId_idx', table: 'products' }, // CamelCase in models -> storeId in DB? Or store_id?
            { name: 'orders_status_idx', table: 'orders' }
        ];

        checks.forEach(check => {
            const found = indexNames.some(name => name.includes(check.name) || name.includes(check.name.replace('storeId', 'store_id')));
            if (found) {
                console.log(`✅ Index trouvé: ${check.name} sur ${check.table}`);
            } else {
                console.warn(`⚠️ Index MANQUANT: ${check.name} sur ${check.table}`);
            }
        });

        console.log('\n📊 RÉSUMÉ FINAL ADMIN :');
        console.table(results);

    } catch (error) {
        console.error('❌ ERREUR AUDIT ADMIN:', error.message);
    } finally {
        process.exit(0);
    }
}

runAdminPerformanceAudit();
