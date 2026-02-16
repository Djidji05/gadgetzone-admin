import sequelize from './src/backend/config/database.js';

async function checkProducts() {
    try {
        const [cols] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            ORDER BY ordinal_position
        `);

        console.log('📊 Colonnes de la table products:');
        console.log('================================');
        cols.forEach(c => {
            console.log(`${c.column_name.padEnd(25)} | ${c.data_type}`);
        });
        console.log('================================');
        console.log(`Total: ${cols.length} colonnes`);

        const hasPrice = cols.some(c => c.column_name === 'price');
        console.log(`\n💰 Colonne 'price' existe: ${hasPrice ? '✅ OUI' : '❌ NON'}`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

checkProducts();
