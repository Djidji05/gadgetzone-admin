/**
 * Script d'optimisation de la base de données HTFasil
 * Ajoute des index sur les colonnes fréquemment recherchées pour réduire les temps de chargement des rapports.
 */
import sequelize from '../src/backend/config/database.js';

const optimizeDB = async () => {
  console.log('🚀 Démarrage de l\'optimisation de la base de données...');
  
  try {
    // 1. Index sur les dates de création (vital pour les rapports temporels)
    console.log('📦 Indexation des dates de création...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at)');
    
    // 2. Index sur les statuts (vital pour filtrer les commandes délivrées)
    console.log('🏷️ Indexation des statuts...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)');
    
    // 3. Index de jointure
    console.log('🔗 Indexation des clés de jointure...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_store_id ON products("storeId")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_payouts_store_id ON payouts("storeId")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_deposits_store_id ON deposits("storeId")');

    console.log('✅ Optimisation terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation :', error);
    process.exit(1);
  }
};

optimizeDB();
