
import { Product } from '../models/index.js';
import { closeConnection } from '../config/database.js';

async function checkImages() {
    try {
        const products = await Product.findAll({ attributes: ['id', 'name', 'image_url'], limit: 5 });
        products.forEach(p => console.log(`Product ${p.id}: ${p.image_url}`));
    } catch (error) {
        console.error(error);
    } finally {
        await closeConnection();
    }
}

checkImages();
