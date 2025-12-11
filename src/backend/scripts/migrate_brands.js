import sequelize from '../config/database.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Create Brands table
        await Brand.sync({ alter: true });
        console.log('Brands table synced.');

        // Add brand_id to Products if not exists
        try {
            await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;');
            console.log('brand_id column added to products.');
        } catch (e) {
            console.error('Error adding brand_id column:', e.message);
        }

        console.log('Migration completed.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
