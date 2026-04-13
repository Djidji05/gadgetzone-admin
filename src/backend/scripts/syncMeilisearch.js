import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, Category, Brand, Store } from '../models/index.js';
import searchService from '../services/searchService.js';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function syncProducts() {
    try {
        console.log('🚀 Starting Meilisearch synchronization...');

        // Configure index settings first
        await searchService.setupIndex();

        // Verify connection
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Fetch all active/published products with associations
        const products = await Product.findAll({
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: Store, as: 'store' }
            ]
        });

        console.log(`📦 Found ${products.length} products to index.`);

        if (products.length > 0) {
            await searchService.syncAll(products);
            console.log('✅ Synchronization completed successfully.');
        } else {
            console.log('⚠️ No products found to sync.');
        }

    } catch (error) {
        console.error('❌ Synchronization failed:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

syncProducts();
