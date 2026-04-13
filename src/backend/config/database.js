import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Charger les variables d'environnement (.env et .env.backend)
dotenv.config();
dotenv.config({ path: '.env.backend' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'htfasil',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: false, // Désactivé pour performance Rocket

  pool: {
    max: 20, // Augmenté pour éviter l'épuisement sous charge
    min: 5,  // Garder quelques connexions ouvertes
    acquire: 45000, // Augmenté à 45s (axios timeout est 10s, mais permet au pool de respirer)
    idle: 10000
  }
};

// Créer l'instance Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: {
      statement_timeout: 45000,
      idle_in_transaction_session_timeout: 45000
    }
  }
);

/**
 * Initialise la connexion à la base de données
 */
export const initDatabase = async () => {
  try {
    console.log('🔌 Connexion à la base de données...');
    console.log(`📋 Paramètres:`);
    console.log(`- Hôte: ${dbConfig.host}`);
    console.log(`- Port: ${dbConfig.port}`);
    console.log(`- Base: ${dbConfig.database}`);
    console.log(`- Utilisateur: ${dbConfig.username}`);

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Test de requête simple
    const [results] = await sequelize.query('SELECT version();');
    console.log('📊 Version PostgreSQL:', results[0].version);

    // Synchroniser les modèles si demandé
    if (process.env.DB_SYNC === 'true') {
      console.log('🔄 Synchronisation des modèles...');
      await syncDatabase({ alter: true });
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données:', error);

    // Vérifier si c'est une erreur Sequelize
    if (error.original) {
      console.error('- Message d\'erreur:', error.original.message || error.message);
      console.error('- Code d\'erreur:', error.original.code);

      // Suggestions basées sur les erreurs courantes
      switch (error.original.code) {
        case 'ECONNREFUSED':
          console.log('💡 Solution: Assurez-vous que PostgreSQL est en cours d\'exécution');
          break;
        case '28P01':
          console.log('💡 Solution: Vérifiez les identifiants de connexion à la base de données');
          break;
        case '3D000':
          console.log('💡 Solution: Créez la base de données avec: CREATE DATABASE htfasil;');
          break;
        default:
          console.log('💡 Solution: Vérifiez votre configuration PostgreSQL');
      }
    }

    return false;
  }
};

/**
 * Synchronise les modèles avec la base de données
 */
export const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;

    if (force && process.env.NODE_ENV === 'production') {
      throw new Error('La synchronisation forcée est désactivée en production');
    }

    // Importer les modèles
    const { default: models } = await import('../models/index.js');

    await sequelize.sync({ force, alter });
    console.log('✅ Base de données synchronisée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    return false;
  }
};

/**
 * Ferme la connexion à la base de données
 */
export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la connexion:', error);
  }
};

export default sequelize;
