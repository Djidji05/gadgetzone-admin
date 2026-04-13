import sequelize, { syncDatabase } from '../config/database.js';
import { Store } from '../models/index.js';

/**
 * Migration script to add latitude and longitude to the stores table.
 */
const migrate = async () => {
    try {
        console.log('🚀 Starting migration for Store location fields...');
        
        // This will use Sequelize's alter: true to add the missing columns
        // while preserving existing data.
        await syncDatabase({ alter: true });
        
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
