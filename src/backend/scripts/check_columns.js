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
        logging: false
    }
);

async function checkColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);

        const columns = results.map(r => r.column_name);
        console.log('images:', columns.includes('images') ? 'PRESENT' : 'MISSING');
        console.log('is_featured:', columns.includes('is_featured') ? 'PRESENT' : 'MISSING');
        console.log('is_new:', columns.includes('is_new') ? 'PRESENT' : 'MISSING');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
