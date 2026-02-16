
import { Product } from '../models/index.js';
import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';

const dumpAllImages = async () => {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll({
            attributes: ['id', 'image_url', 'images']
        });

        const outputPath = path.resolve('src/backend/scripts/all_product_images.txt');
        const logStream = fs.createWriteStream(outputPath, { flags: 'w' });

        console.log(`Found ${products.length} products. Writing to file...`);

        products.forEach(p => {
            // Write simpler format to avoid huge lines base64
            let img = p.image_url || '';
            if (img.length > 100 && img.startsWith('data:')) {
                img = 'data:image/... (truncated)';
            }
            logStream.write(`${p.id}|${img}|${JSON.stringify(p.images)}\n`);
        });
        logStream.end();

        console.log(`Done. Output written to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

dumpAllImages();
