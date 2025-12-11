
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
      WHERE image_url IS NULL OR image_url = '' OR image_url = 'null'
      LIMIT 10;
    `);

        if (products.length === 0) {
            console.log('No products found with empty image_url');

            // Let's check a few products anyway to see structure
            const [allProducts] = await sequelize.query(`
            SELECT id, name, image_url, images 
            FROM products 
            LIMIT 3;
        `);
            console.log('Sample of existing products:');
            console.log(JSON.stringify(allProducts.map(p => ({
                id: p.id,
                name: p.name,
                image_url_type: typeof p.image_url,
                image_url_val: p.image_url ? (p.image_url.length > 50 ? p.image_url.substring(0, 50) + '...' : p.image_url) : 'NULL/EMPTY',
                images_type: typeof p.images,
                images_val: p.images
            })), null, 2));

        } else {
            console.log('Found products with empty image_url:');
            console.log(JSON.stringify(products.map(p => ({
                id: p.id,
                name: p.name,
                images_type: typeof p.images,
                images_val: p.images,
                is_array: Array.isArray(p.images)
            })), null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkImagesColumn();
