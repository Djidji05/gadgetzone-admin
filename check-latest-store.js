import sequelize from './src/backend/config/database.js';

async function checkLatestStore() {
    try {
        // Get the latest store
        const [stores] = await sequelize.query(`
            SELECT s.*, u.name as owner_name, u.email as owner_email, u.role as owner_role
            FROM stores s 
            LEFT JOIN users u ON s.user_id = u.id 
            ORDER BY s.id DESC 
            LIMIT 1
        `);

        console.log('📦 Latest store (hhhh):');
        console.log('='.repeat(50));
        console.log('ID:', stores[0].id);
        console.log('Name:', stores[0].name);
        console.log('user_id:', stores[0].user_id);
        console.log('Owner name:', stores[0].owner_name);
        console.log('Owner email:', stores[0].owner_email);
        console.log('Owner role:', stores[0].owner_role);
        console.log('='.repeat(50));

        if (!stores[0].user_id) {
            console.log('\n❌ PROBLÈME: user_id est NULL !');
            console.log('La candidature a été créée sans user_id.');
        } else {
            console.log('\n✅ user_id existe:', stores[0].user_id);
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

checkLatestStore();
