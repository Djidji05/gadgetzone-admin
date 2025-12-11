import sequelize from '../config/database.js';

async function checkCategories() {
    try {
        const [categories] = await sequelize.query('SELECT id, name FROM categories ORDER BY id');

        console.log('\n📂 Categories in database:');
        console.log('==========================');
        categories.forEach(cat => {
            console.log(`ID: ${cat.id} | Name: ${cat.name}`);
        });
        console.log('==========================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCategories();
