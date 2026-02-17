import { syncDatabase, closeConnection } from './src/backend/config/database.js';

async function runSync() {
    try {
        console.log('Starting schema sync...');
        await syncDatabase({ alter: true });
        console.log('Schema sync completed.');
    } catch (error) {
        console.error('Schema sync failed:', error);
    } finally {
        await closeConnection();
    }
}

runSync();
