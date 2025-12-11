
import { Sequelize, DataTypes } from 'sequelize';
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

async function debugCartLogic() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const [products] = await sequelize.query(`
      SELECT id, name, image_url, images 
      FROM products
    `);

        console.log(`Found ${products.length} products.`);

        let discrepancies = 0;

        products.forEach(p => {
            const backendImage = p.image_url || (p.images && p.images.length > 0 ? p.images[0] : null);

            // Check if "images" is actually populated
            const hasImagesArray = p.images && Array.isArray(p.images) && p.images.length > 0;
            const hasImageUrl = !!p.image_url;

            if (!backendImage) {
                console.log(`[ALERT] Product ${p.id} (${p.name}) results in NULL image in Cart.`);
                console.log(`   - image_url: ${p.image_url ? 'PRESENT' : 'NULL'}`);
                console.log(`   - images: ${JSON.stringify(p.images)} (Type: ${typeof p.images}, IsArray: ${Array.isArray(p.images)})`);

                if (hasImagesArray) {
                    console.log(`   !!! DISCREPANCY: images array exists but logic failed?!`);
                }
                discrepancies++;
            }
        });

        if (discrepancies === 0) {
            console.log('No products found that would result in NULL image in cart.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugCartLogic();
