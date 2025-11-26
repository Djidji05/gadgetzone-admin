import { Sequelize } from 'sequelize';
import sequelize from '../config/database';

// Import des modèles
import Product from './Product';

// Initialisation des modèles
const db = {
  // Modèles
  Product,
  
  // Instance Sequelize
  sequelize,
  Sequelize,
};

// Configuration des associations entre les modèles (à ajouter plus tard)
// Exemple :
// Object.values(db).forEach(model => {
//   if (model.associate) {
//     model.associate(db);
//   }
// });

export default db;
