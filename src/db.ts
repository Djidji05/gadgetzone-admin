import { Sequelize } from 'sequelize';
import sequelize from './config/database';

/**
 * Synchronise les modèles avec la base de données
 * @param options Options de synchronisation
 */
const syncDatabase = async (options: {
  force?: boolean;
  alter?: boolean;
} = {}) => {
  try {
    const { force = false, alter = false } = options;
    
    if (force && process.env.NODE_ENV === 'production') {
      throw new Error('La synchronisation forcée est désactivée en production');
    }

    await sequelize.sync({ force, alter });
    console.log('✅ Base de données synchronisée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation de la base de données:', error);
    throw error;
  }
};

/**
 * Vérifie la connexion à la base de données
 */
const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    return false;
  }
};

/**
 * Ferme la connexion à la base de données
 */
const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la connexion:', error);
    throw error;
  }
};

export { sequelize, Sequelize, syncDatabase, checkDatabaseConnection, closeConnection };
