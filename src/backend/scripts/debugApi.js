import { initDatabase } from '../config/database.js';
import { User, Product, Category, Order } from '../models/index.js';

const debugApi = async () => {
  try {
    console.log('🔍 Debug API...');
    
    // Afficher les variables d'environnement
    console.log('📋 Variables d\'environnement :');
    console.log(`- DB_HOST: ${process.env.DB_HOST}`);
    console.log(`- DB_PORT: ${process.env.DB_PORT}`);
    console.log(`- DB_NAME: ${process.env.DB_NAME}`);
    console.log(`- DB_USER: ${process.env.DB_USER}`);
    console.log(`- DB_PASSWORD: ${process.env.DB_PASSWORD || '(vide)'}`);
    
    // Test de connexion
    const connected = await initDatabase();
    if (!connected) {
      console.error('❌ Connexion échouée');
      return;
    }
    
    console.log('✅ Connexion réussie');
    
    // Test des utilisateurs
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      limit: 3
    });
    
    console.log(`👥 Utilisateurs trouvés : ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    
    // Test des produits
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }],
      limit: 3
    });
    
    console.log(`📦 Produits trouvés : ${products.length}`);
    products.forEach(product => {
      console.log(`  - ${product.name} (${product.price}€)`);
    });
    
    // Test format API
    console.log('\n🔄 Test format API clients...');
    const clients = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total_amount', 'status', 'created_at']
        }
      ],
      limit: 3
    });
    
    const formattedClients = clients.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      orders_count: user.orders ? user.orders.length : 0
    }));
    
    console.log('📤 Format API clients :');
    console.log(JSON.stringify(formattedClients, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    console.error('Stack :', error.stack);
  } finally {
    process.exit(0);
  }
};

debugApi();
