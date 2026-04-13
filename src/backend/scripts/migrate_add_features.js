
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path related to where this script will be located
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

console.log('Environment:', {
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT
});

const sequelize = new Sequelize(
    process.env.DB_NAME || 'htfasil',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: console.log,
    }
);

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Add features column
        try {
            await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "features" JSON DEFAULT '[]';`);
            console.log('✅ Added features column.');
        } catch (e) {
            console.log('⚠️ Could not add features column (might exist or error):', e.message);
        }

        // Add specifications column
        try {
            await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "specifications" JSON DEFAULT '{}';`);
            console.log('✅ Added specifications column.');
        } catch (e) {
            console.log('⚠️ Could not add specifications column (might exist or error):', e.message);
        }

        // Check columns
        const [results] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products';
    `);
        console.log('📊 Current Columns:', results.map(r => r.column_name));

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
