import sequelize from '../config/database.js';

/**
 * Script de diagnostic pour comprendre pourquoi 0 produits s'affichent
 */
async function diagnose() {
    try {
        console.log('🔍 Diagnostic des statistiques dashboard\n');

        // 1. Vérifier les commandes
        const [orders] = await sequelize.query(`
      SELECT id, user_id, status, total_amount, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

        console.log('📋 Commandes récentes:');
        console.table(orders);

        // 2. Vérifier les order_items
        const [orderItems] = await sequelize.query(`
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, o.status
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

        console.log('\n📦 Order Items:');
        console.table(orderItems);

        // 3. Calculer les stats comme le fait l'API
        const [stats] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as delivered_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered') as revenue,
        (SELECT COALESCE(SUM(oi.quantity), 0) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.status = 'delivered') as products_sold
    `, { type: sequelize.QueryTypes.SELECT });

        console.log('\n📊 Statistiques calculées:');
        console.table(stats);

        // 4. Vérifier les produits
        const [products] = await sequelize.query(`
      SELECT COUNT(*) as count FROM products
    `, { type: sequelize.QueryTypes.SELECT });

        console.log('\n📦 Total produits:', products.count);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
