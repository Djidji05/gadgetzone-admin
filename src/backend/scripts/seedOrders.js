import { Order, OrderItem, User, Product } from '../models/index.js';
import { initDatabase } from '../config/database.js';

/**
 * Script pour créer des commandes de test
 */
const seedOrders = async () => {
  try {
    console.log('🚀 Création des commandes de test...');
    
    // Initialiser la connexion
    const dbConnected = await initDatabase();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }
    
    // Récupérer les utilisateurs et produits existants
    const users = await User.findAll({ where: { role: 'user' } });
    const products = await Product.findAll();
    
    if (users.length === 0 || products.length === 0) {
      console.log('❌ Aucun utilisateur ou produit trouvé. Exécutez d\'abord npm run init:database');
      process.exit(1);
    }
    
    // Créer des commandes de test
    const orders = [];
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Créer 1-3 items par commande
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        selectedProducts.push({
          product_id: product.id,
          quantity,
          price: product.price
        });
      }
      
      // Calculer le total
      const totalAmount = selectedProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      // Créer la commande
      const order = await Order.create({
        user_id: user.id,
        total_amount: totalAmount,
        status,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
      });
      
      // Créer les items de commande
      for (const item of selectedProducts) {
        await OrderItem.create({
          order_id: order.id,
          ...item
        });
      }
      
      orders.push(order);
    }
    
    console.log(`✅ ${orders.length} commandes créées avec succès !`);
    
    // Afficher les statistiques
    const orderStats = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total_amount')), 'total']
      ],
      group: ['status']
    });
    
    console.log('\n📊 Statistiques des commandes :');
    orderStats.forEach(stat => {
      console.log(`${stat.status}: ${stat.count} commandes, total: ${parseFloat(stat.total || 0).toFixed(2)}€`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des commandes:', error);
    process.exit(1);
  }
};

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOrders()
    .then(() => {
      console.log('🎉 Création des commandes terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default seedOrders;
