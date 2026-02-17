import sequelize from './src/backend/config/database.js';
import Promotion from './src/backend/models/Promotion.js';
import Store from './src/backend/models/Store.js';

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connexion réussie');

        // S'assurer que les dépendances sont là
        await Store.sync({ alter: true });
        console.log('Store synchronisé');

        await Promotion.sync({ alter: true });
        console.log('✅ Table promotions synchronisée avec succès');

    } catch (e) {
        console.error('❌ Erreur lors de la synchronisation:', e);
    } finally {
        await sequelize.close();
    }
}

sync();
