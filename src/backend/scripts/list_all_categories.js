import sequelize from '../config/database.js';

async function listCategories() {
    try {
        const [categories] = await sequelize.query('SELECT id, name FROM categories ORDER BY id');

        console.log('\n📂 All Categories:');
        console.log('==================');
        categories.forEach(cat => {
            console.log(`ID: ${cat.id.toString().padStart(2, ' ')} | Name: ${cat.name}`);
        });
        console.log('==================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listCategories();
