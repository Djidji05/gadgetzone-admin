
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path related to where this script will be located
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);

        console.log('Columns in products table:', results);
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
