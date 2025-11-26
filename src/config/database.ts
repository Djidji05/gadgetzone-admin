import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Récupérer les variables d'environnement (côté client avec Vite ou côté serveur)
const getEnv = (key: string, defaultValue?: string): string => {
  // Essayer d'abord avec import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[`VITE_${key}`] || process.env[key] || defaultValue) as string;
  }
  // Sinon, utiliser process.env (Node.js)
  return process.env[key] || defaultValue || '';
};

const dbConfig = {
  host: getEnv('DB_HOST', 'localhost'),
  port: parseInt(getEnv('DB_PORT', '5432'), 10),
  database: getEnv('DB_NAME', 'gadgetzone'),
  username: getEnv('DB_USER', 'postgres'),
  password: getEnv('DB_PASSWORD', ''),
  nodeEnv: getEnv('NODE_ENV', 'development')
};

console.log('🔍 Configuration de la base de données...');
console.log('📋 Paramètres de connexion:');
console.log(`- Hôte: ${dbConfig.host}`);
console.log(`- Port: ${dbConfig.port}`);
console.log(`- Base de données: ${dbConfig.database}`);
console.log(`- Utilisateur: ${dbConfig.username}`);
console.log(`- Environnement: ${dbConfig.nodeEnv}`);

// Vérification des paramètres requis
if (!dbConfig.database || !dbConfig.username || !dbConfig.password) {
  const errorMsg = '❌ Configuration de la base de données incomplète. Vérifiez vos variables d\'environnement.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Configuration de la connexion à PostgreSQL
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: (sql: string, timing?: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📌 [SQL] ${sql}`);
        if (timing) console.log(`⏱️  [SQL] Temps d'exécution: ${timing}ms`);
      }
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Options spécifiques à PostgreSQL
    dialectOptions: {
      decimalNumbers: true,
      ssl: false, // Désactivez si vous n'utilisez pas SSL
      // Timeout de connexion plus long pour le débogage (en millisecondes)
      statement_timeout: 10000,
      idle_in_transaction_session_timeout: 10000,
      // Si vous utilisez un socket Unix
      // socketPath: '/var/run/postgresql',
    },
  }
);

// Tester la connexion à la base de données
const testConnection = async () => {
  console.log('🔌 Test de connexion à la base de données...');
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    
    // Tester une requête simple
    try {
      const [results] = await sequelize.query('SELECT version();');
      console.log('ℹ️ Version de PostgreSQL:', results);
    } catch (queryError) {
      console.error('⚠️ Erreur lors de l\'exécution de la requête de test:', queryError);
    }
    
    return true;
  } catch (error: unknown) {
    console.error('❌ Impossible de se connecter à la base de données:');
    
    // Vérifier si c'est une erreur Sequelize
    if (error instanceof Error) {
      const sequelizeError = error as {
        original?: {
          code?: string;
          message?: string;
        };
        message: string;
      };
      
      console.error('- Message d\'erreur:', sequelizeError.original?.message || sequelizeError.message);
      
      if (sequelizeError.original?.code) {
        console.error('- Code d\'erreur:', sequelizeError.original.code);
        
        // Suggestions basées sur le code d'erreur
        switch (sequelizeError.original.code) {
          case 'ECONNREFUSED':
            console.error('\n💡 Conseil: Le serveur PostgreSQL ne semble pas être en cours d\'exécution ou n\'écoute pas sur le port spécifié.');
            break;
          case '3D000':
            console.error('\n💡 Conseil: La base de données spécifiée n\'existe pas. Avez-vous créé la base de données?');
            break;
          case '28P01':
            console.error('\n💡 Conseil: Échec de l\'authentification. Vérifiez le nom d\'utilisateur et le mot de passe.');
            break;
          default:
            console.error('\n💡 Conseil: Vérifiez la configuration de votre base de données et assurez-vous que PostgreSQL est correctement installé et en cours d\'exécution.');
        }
      }
    } else {
      console.error('- Erreur inconnue:', error);
    }
    
    return false;
  }
};

// Exporter la fonction de test de connexion
export { testConnection };

export default sequelize;
