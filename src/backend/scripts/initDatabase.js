import bcrypt from 'bcrypt';
import { initDatabase, syncDatabase } from '../config/database.js';
import { Category, Product, User } from '../models/index.js';

/**
 * Script d'initialisation de la base de données
 */
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Initialiser la connexion
    const dbConnected = await initDatabase();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // Synchroniser les modèles
    const syncResult = await syncDatabase({ force: false, alter: true });
    if (!syncResult) {
      console.error('❌ Impossible de synchroniser la base de données');
      process.exit(1);
    }

    console.log('✅ Base de données synchronisée');

    console.log('📝 Création des données initiales...');

    // Créer les catégories
    const categories = await Category.bulkCreate([
      { name: 'Électronique', description: 'Appareils électroniques et gadgets' },
      { name: 'Accessoires', description: 'Accessoires pour téléphones et ordinateurs' },
      { name: 'Maison Connectée', description: 'Appareils pour la maison intelligente' },
      { name: 'Gaming', description: 'Consoles de jeux et accessoires' }
    ]);

    // Créer les produits
    const products = await Product.bulkCreate([
      {
        name: 'Smartphone Pro',
        description: 'Dernier smartphone avec écran AMOLED et 5G',
        price: 899.99,
        stock: 50,
        category_id: categories[0].id,
        image_url: '/images/products/smartphone.jpg'
      },
      {
        name: 'Laptop Ultra',
        description: 'Ordinateur portable ultra-fin avec processeur dernière génération',
        price: 1299.99,
        stock: 25,
        category_id: categories[0].id,
        image_url: '/images/products/laptop.jpg'
      },
      {
        name: 'Écouteurs Sans Fil',
        description: 'Écouteurs Bluetooth avec réduction de bruit',
        price: 199.99,
        stock: 100,
        category_id: categories[1].id,
        image_url: '/images/products/earbuds.jpg'
      },
      {
        name: 'Montre Intelligente',
        description: 'Smartwatch avec suivi fitness et notifications',
        price: 299.99,
        stock: 75,
        category_id: categories[0].id,
        image_url: '/images/products/smartwatch.jpg'
      },
      {
        name: 'Console de Gaming',
        description: 'Console de nouvelle génération avec 4K',
        price: 499.99,
        stock: 30,
        category_id: categories[3].id,
        image_url: '/images/products/console.jpg'
      }
    ]);

    // Créer les utilisateurs
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@htfasil.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        name: 'Pierre Durand',
        email: 'pierre.durand@example.com',
        password: hashedPassword,
        role: 'user'
      }
    ]);

    console.log('✅ Base de données initialisée avec succès !');
    console.log(`📊 ${categories.length} catégories créées`);
    console.log(`📦 ${products.length} produits créés`);
    console.log(`👥 ${users.length} utilisateurs créés`);
    console.log('');
    console.log('🔑 Comptes de test :');
    console.log('Admin: admin@htfasil.com / password123');
    console.log('Client: jean.dupont@example.com / password123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default initializeDatabase;
