
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'gadgetzone',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);

async function checkImages() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [products] = await sequelize.query(`
      SELECT id, name, image_url, "features", "specifications"
      FROM products 
      LIMIT 5;
    `);

        console.log('Sample Products Images:', products.map(p => ({
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            has_image: !!p.image_url
        })));

    } catch (error) {
        console.error('Error checking images:', error);
    } finally {
        await sequelize.close();
    }
}

checkImages();
