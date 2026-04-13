import { Category } from '../models/index.js';

async function checkCategories() {
    try {
        console.log('--- Categories Diagnostic ---');
        const categories = await Category.findAll();
        console.log(`Found ${categories.length} categories.`);
        if (categories.length > 0) {
            console.log('Sample:', categories[0].toJSON());
        } else {
            console.log('Table is empty.');
        }
    } catch (error) {
        console.error('❌ Error querying categories:', error);
        if (error.name === 'SequelizeDatabaseError') {
            console.error('Database Error details:', error.parent);
        }
    } finally {
        process.exit();
    }
}

checkCategories();
