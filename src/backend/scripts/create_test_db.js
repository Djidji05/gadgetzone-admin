import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const sequelize = new Sequelize('postgres', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'admin', {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false
});

async function createDb() {
    try {
        await sequelize.authenticate();
        console.log('Connected to postgres database.');

        const dbName = 'htfasil_test';
        await sequelize.query(`CREATE DATABASE ${dbName};`);
        console.log(`Database ${dbName} created successfully.`);
    } catch (error) {
        if (error.original && error.original.code === '42P04') {
            console.log('Database already exists.');
        } else {
            console.error('Error creating database:', error);
        }
    } finally {
        await sequelize.close();
    }
}

createDb();
