import sequelize from './src/backend/config/database.js';
import fs from 'fs';

const sql = fs.readFileSync('./fix-bouttech.sql', 'utf8');

async function run() {
    try {
        const result = await sequelize.query(sql);
        console.log('✅ SQL executed successfully');
        console.log('Result:', JSON.stringify(result[0], null, 2));
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

run();
