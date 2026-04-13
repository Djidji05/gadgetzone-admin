import sequelize from '../config/database.js';

async function diagnoseAdminSlowQueries() {
    console.log('🔍 DIAGNOSTIC PROFOND DES REQUÊTES ADMIN (EXPLAIN)');
    console.log('==================================================');

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        console.log('\n💎 ANALYSE DE LA REQUÊTE DASHBOARD OVERVIEW:');
        const [analysis] = await sequelize.query(`
            EXPLAIN ANALYZE
            SELECT 
                COALESCE(SUM(oi.price * oi.quantity * s.commission_rate / 100), 0) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            JOIN stores s ON p."storeId" = s.id
            WHERE o.status = 'delivered' AND o.created_at >= :startDate
        `, { replacements: { startDate }, type: sequelize.QueryTypes.SELECT });
        
        console.log(analysis['QUERY PLAN']);

        console.log('\n📦 ANALYSE DE LA REQUÊTE LISTING COMMANDES:');
        const [listingAnalysis] = await sequelize.query(`
            EXPLAIN ANALYZE
            SELECT o.*, u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 50
        `, { type: sequelize.QueryTypes.SELECT });
        
        console.log(listingAnalysis['QUERY PLAN']);

    } catch (error) {
        console.error('❌ ERREUR DIAGNOSTIC:', error.message);
    } finally {
        process.exit(0);
    }
}

diagnoseAdminSlowQueries();
