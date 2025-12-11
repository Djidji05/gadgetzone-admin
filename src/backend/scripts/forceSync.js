import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/index.js'; // Import models to register them

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

async function forceSync() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Force sync with alter
        await sequelize.sync({ alter: true });
        console.log('Database synced with alter: true');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

forceSync();
