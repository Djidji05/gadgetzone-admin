
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '../../../.env.backend');
console.log('📂 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
}

// Ensure DB_PASSWORD is a string (even if empty)
// dotenv might load empty value as empty string, which is fine.
const dbPassword = process.env.DB_PASSWORD || '';

console.log('🔧 DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    db: process.env.DB_NAME,
    passwordLength: dbPassword.length
});

const sequelize = new Sequelize(
    process.env.DB_NAME || 'htfasil',
    process.env.DB_USER || 'postgres',
    dbPassword,
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false,
    }
);

async function checkAdminUsers() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to database has been established successfully.');

        const [results] = await sequelize.query("SELECT id, name, email, role FROM users WHERE role IN ('admin', 'Admin', 'gestionnaire')");

        console.log('\n🔍 --- Admin/Manager Users Check ---');
        if (results.length === 0) {
            console.log('❌ No admin users found!');
        } else {
            console.table(results);
        }

        const [allUsers] = await sequelize.query("SELECT id, name, email, role FROM users LIMIT 10");
        console.log('\n👥 --- First 10 Users ---');
        console.table(allUsers);

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkAdminUsers();
