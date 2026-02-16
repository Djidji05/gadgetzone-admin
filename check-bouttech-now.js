import sequelize from './src/backend/config/database.js';

async function checkBouttech() {
    try {
        const [stores] = await sequelize.query(`
            SELECT s.id, s.name, s.user_id, 
                   u.name as owner_name, 
                   u.email as owner_email, 
                   u.role as owner_role
            FROM stores s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.name = 'bouttech'
        `);

        console.log('📦 Bouttech store:');
        console.log(JSON.stringify(stores[0], null, 2));

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

checkBouttech();
