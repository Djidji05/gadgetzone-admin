import sequelize from './src/backend/config/database.js';

async function checkStoresTable() {
    try {
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'stores' 
            ORDER BY ordinal_position;
        `);

        console.log('\n📊 Structure de la table stores:');
        console.log('================================');
        results.forEach(col => {
            console.log(`${col.column_name.padEnd(20)} | ${col.data_type}`);
        });
        console.log('================================\n');

        // Also check if there are any stores
        const [stores] = await sequelize.query('SELECT * FROM stores LIMIT 5');
        console.log(`\n📦 Nombre de stores: ${stores.length}`);
        if (stores.length > 0) {
            console.log('Colonnes disponibles:', Object.keys(stores[0]));
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkStoresTable();
