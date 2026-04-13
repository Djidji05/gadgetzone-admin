import sequelize from '../config/database.js';
import { Product, User, Order, OrderItem, Category } from '../models/index.js';

/**
 * Script d'initialisation des données de démonstration
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Début de l\'initialisation des données...');

    // Synchroniser la base de données
    await sequelize.sync({ force: true });
    console.log('✅ Base de données synchronisée');

    // Créer les catégories
    const categories = await Category.bulkCreate([
      { name: 'Smartphones', description: 'Téléphones intelligents et accessoires' },
      { name: 'Ordinateurs', description: 'Ordinateurs portables et de bureau' },
      { name: 'Tablettes', description: 'Tablettes et e-readers' },
      { name: 'Accessoires', description: 'Accessoires électroniques et gadgets' },
      { name: 'Audio', description: 'Écouteurs, haut-parleurs et équipements audio' },
      { name: 'Gaming', description: 'Consoles de jeux et accessoires gaming' }
    ]);
    console.log(`✅ ${categories.length} catégories créées`);

    // Créer les produits
    const products = await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro Max',
        description: 'Le dernier iPhone avec processeur A17 Pro et système de caméras avancé',
        price: 1299.99,
        stock: 25,
        category_id: 1,
        image_url: 'https://placehold.co/300x300/3B82F6/FFFFFF?text=iPhone+15+Pro+Max'
      },
      {
        name: 'MacBook Pro 16"',
        description: 'Ordinateur portable puissant avec puce M3 Max',
        price: 2499.99,
        stock: 15,
        category_id: 2,
        image_url: 'https://placehold.co/300x300/6366F1/FFFFFF?text=MacBook+Pro+16'
      },
      {
        name: 'iPad Pro 12.9"',
        description: 'Tablette professionnelle avec écran Liquid Retina XDR',
        price: 1099.99,
        stock: 20,
        category_id: 3,
        image_url: 'https://placehold.co/300x300/8B5CF6/FFFFFF?text=iPad+Pro+12.9'
      },
      {
        name: 'AirPods Pro 2',
        description: 'Écouteurs sans fil avec réduction de bruit active',
        price: 249.99,
        stock: 50,
        category_id: 5,
        image_url: 'https://placehold.co/300x300/10B981/FFFFFF?text=AirPods+Pro+2'
      },
      {
        name: 'PlayStation 5',
        description: 'Console de jeux nouvelle génération',
        price: 499.99,
        stock: 30,
        category_id: 6,
        image_url: 'https://placehold.co/300x300/F59E0B/FFFFFF?text=PlayStation+5'
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Android haut de gamme avec stylo S Pen',
        price: 1199.99,
        stock: 18,
        category_id: 1,
        image_url: 'https://placehold.co/300x300/EF4444/FFFFFF?text=Galaxy+S24+Ultra'
      },
      {
        name: 'Dell XPS 15',
        description: 'Ordinateur portable premium avec écran OLED',
        price: 1799.99,
        stock: 12,
        category_id: 2,
        image_url: 'https://placehold.co/300x300/64748B/FFFFFF?text=Dell+XPS+15'
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Casque audio sans fil avec réduction de bruit',
        price: 399.99,
        stock: 35,
        category_id: 5,
        image_url: 'https://placehold.co/300x300/84CC16/FFFFFF?text=Sony+WH-1000XM5'
      }
    ]);
    console.log(`✅ ${products.length} produits créés`);

    // Créer un utilisateur admin de démonstration
    const adminUser = await User.create({
      email: 'admin@htfasil.com',
      password: '$2b$10$rQZ8kHKHKpZ8K9m9K9K9Ke9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9', // password: admin123
      first_name: 'Admin',
      last_name: 'htfasil',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Utilisateur admin créé');

    // Créer des utilisateurs clients de démonstration
    const customers = await User.bulkCreate([
      {
        email: 'john.doe@example.com',
        password: '$2b$10$rQZ8kHKHKpZ8K9m9K9K9Ke9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9', // password: password123
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
        is_active: true
      },
      {
        email: 'jane.smith@example.com',
        password: '$2b$10$rQZ8kHKHKpZ8K9m9K9K9Ke9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9', // password: password123
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'customer',
        is_active: true
      }
    ]);
    console.log(`✅ ${customers.length} clients créés`);

    // Créer quelques commandes de démonstration
    const orders = await Order.bulkCreate([
      {
        user_id: customers[0].id,
        status: 'delivered',
        total_amount: 1549.98,
        shipping_address: '123 Main St, New York, NY 10001',
        created_at: new Date('2024-01-15')
      },
      {
        user_id: customers[1].id,
        status: 'processing',
        total_amount: 899.98,
        shipping_address: '456 Oak Ave, Los Angeles, CA 90210',
        created_at: new Date('2024-02-20')
      }
    ]);
    console.log(`✅ ${orders.length} commandes créées`);

    // Créer les éléments des commandes
    await OrderItem.bulkCreate([
      {
        order_id: orders[0].id,
        product_id: products[0].id, // iPhone 15 Pro Max
        quantity: 1,
        unit_price: 1299.99
      },
      {
        order_id: orders[0].id,
        product_id: products[3].id, // AirPods Pro 2
        quantity: 1,
        unit_price: 249.99
      },
      {
        order_id: orders[1].id,
        product_id: products[1].id, // MacBook Pro 16"
        quantity: 1,
        unit_price: 2499.99
      },
      {
        order_id: orders[1].id,
        product_id: products[7].id, // Sony WH-1000XM5
        quantity: 1,
        unit_price: 399.99
      }
    ]);
    console.log('✅ Éléments des commandes créés');

    console.log('🎉 Initialisation des données terminée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`- Catégories: ${categories.length}`);
    console.log(`- Produits: ${products.length}`);
    console.log(`- Utilisateurs: ${1 + customers.length}`);
    console.log(`- Commandes: ${orders.length}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données:', error);
    return false;
  }
};

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then((success) => {
      if (success) {
        console.log('\n✅ Données de démonstration initialisées avec succès');
        process.exit(0);
      } else {
        console.log('\n❌ Échec de l\'initialisation des données');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Erreur inattendue:', error);
      process.exit(1);
    });
}
