import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'gadgetzone',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: console.log
    }
);

async function fixImageUrlType() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        console.log('Altering image_url column type to TEXT...');
        await sequelize.query('ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;');
        console.log('Successfully altered image_url column type.');

    } catch (error) {
        console.error('Error altering column:', error);
    } finally {
        await sequelize.close();
    }
}

fixImageUrlType();
