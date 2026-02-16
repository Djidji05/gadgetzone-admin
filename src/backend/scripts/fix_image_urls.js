
import { Product, Store } from '../models/index.js';
import { closeConnection } from '../config/database.js';
import { Op } from 'sequelize';

async function fixImageUrls() {
    try {
        console.log('--- Fixing Image URLs (3001 -> 3003) ---');

        // 1. Fix Products
        const products = await Product.findAll({
            where: {
                image_url: { [Op.like]: '%:3001%' }
            }
        });

        console.log(`Found ${products.length} products with old port.`);

        for (const p of products) {
            if (p.image_url) {
                p.image_url = p.image_url.replace(':3001', ':3003');
                await p.save();
                console.log(`Updated Product ${p.id}`);
            }
        }

        // 2. Fix Stores
        const stores = await Store.findAll({
            where: {
                logo_url: { [Op.like]: '%:3001%' }
            }
        });

        console.log(`Found ${stores.length} stores with old port.`);

        for (const s of stores) {
            if (s.logo_url) {
                s.logo_url = s.logo_url.replace(':3001', ':3003');
                await s.save();
                console.log(`Updated Store ${s.id}`);
            }
        }

        console.log('--- Done ---');

    } catch (error) {
        console.error('Error fixing images:', error);
    } finally {
        await closeConnection();
    }
}

fixImageUrls();
