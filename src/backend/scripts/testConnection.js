import { initDatabase, syncDatabase } from '../config/database.js';
import { Product, User, Category } from '../models/index.js';

const testConnection = async () => {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Test de connexion
    const connected = await initDatabase();
    if (!connected) {
      console.error('❌ Échec de la connexion à la base de données');
      return;
    }
    
    console.log('✅ Connexion réussie !');
    
    // Test de synchronisation
    const syncResult = await syncDatabase({ force: false });
    if (!syncResult) {
      console.error('❌ Échec de la synchronisation');
      return;
    }
    
    console.log('✅ Synchronisation réussie !');
    
    // Test de récupération des données
    const productCount = await Product.count();
    const userCount = await User.count();
    const categoryCount = await Category.count();
    
    console.log(`📊 Statistiques :`);
    console.log(`   - Produits : ${productCount}`);
    console.log(`   - Utilisateurs : ${userCount}`);
    console.log(`   - Catégories : ${categoryCount}`);
    
    // Test de récupération d'un produit
    if (productCount > 0) {
      const firstProduct = await Product.findOne({
        include: [{ model: Category, as: 'category' }]
      });
      console.log(`📦 Premier produit :`, firstProduct?.name || 'Aucun');
    }
    
    console.log('🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
    console.error('Détails :', error);
  } finally {
    process.exit(0);
  }
};

testConnection();
