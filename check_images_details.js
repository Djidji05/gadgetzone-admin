
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

async function checkImagesColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Fetch products that might have empty image_url
        const [products] = await sequelize.query(`
      SELECT id, name, image_url, images 
      FROM products 
      WHERE image_url IS NULL OR image_url = ''
      LIMIT 10;
    `);

        console.log('Products with missing image_url:', products.map(p => ({
            id: p.id,
            name: p.name,
            images_type: typeof p.images,
            images_value: p.images,
            is_array: Array.isArray(p.images)
        })));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkImagesColumn();
