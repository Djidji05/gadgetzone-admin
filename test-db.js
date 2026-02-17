import sequelize from './src/backend/config/database.js';
import './src/backend/models/index.js';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connexion réussie');
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables:', tables);
        if (tables.includes('promotions')) {
            console.log('✅ Table promotions existe');
            const columns = await sequelize.getQueryInterface().describeTable('promotions');
            console.log('Colonnes promotions:', Object.keys(columns));
        } else {
            console.log('❌ Table promotions ABSENTE');
        }
    } catch (e) {
        console.error('Erreur:', e);
    } finally {
        await sequelize.close();
    }
}

test();
