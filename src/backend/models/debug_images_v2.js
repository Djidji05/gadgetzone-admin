
import fs from 'fs';
import { Product } from '../models/index.js';
import { closeConnection } from '../config/database.js';

async function checkImages() {
    const logStream = fs.createWriteStream('debug_images.txt');
    function log(msg) { console.log(msg); logStream.write(msg + '\n'); }

    try {
        const products = await Product.findAll({ attributes: ['id', 'name', 'image_url'], limit: 10 });
        products.forEach(p => log(`Product ${p.id}: ${p.image_url}`));
    } catch (error) {
        log(error.message);
    } finally {
        logStream.end();
        await closeConnection();
    }
}

checkImages();
