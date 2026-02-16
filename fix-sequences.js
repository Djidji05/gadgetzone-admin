import sequelize from './src/backend/config/database.js';

async function fixSequences() {
    try {
        console.log('🔧 Fixing PostgreSQL sequences...\n');

        // Fix users sequence
        await sequelize.query(`
            SELECT setval(pg_get_serial_sequence('users', 'id'), 
                   COALESCE((SELECT MAX(id) FROM users), 1), 
                   true);
        `);
        console.log('✅ Users sequence fixed');

        // Fix other tables that might have the same issue
        const tables = ['products', 'categories', 'brands', 'stores', 'orders', 'notifications'];

        for (const table of tables) {
            try {
                await sequelize.query(`
                    SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
                           COALESCE((SELECT MAX(id) FROM ${table}), 1), 
                           true);
                `);
                console.log(`✅ ${table} sequence fixed`);
            } catch (err) {
                console.log(`⚠️  ${table} sequence skip (table might not exist)`);
            }
        }

        console.log('\n🎉 All sequences fixed!');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

fixSequences();
