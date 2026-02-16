
import { Product } from '../models/index.js';
import sequelize from '../config/database.js';
import fs from 'fs';
import path from 'path';

const checkImages = async () => {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll({
            attributes: ['id', 'name', 'image_url']
        });

        const outputPath = path.resolve('src/backend/scripts/debug_images_output.txt');
        const logStream = fs.createWriteStream(outputPath, { flags: 'w' });

        logStream.write('--- Product Images ---\n');
        products.forEach(p => {
            logStream.write(`ID: ${p.id} | Name: ${p.name.substring(0, 20)} | Image: ${p.image_url}\n`);
        });
        logStream.write('----------------------\n');
        logStream.end();

        console.log(`Output written to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkImages();
