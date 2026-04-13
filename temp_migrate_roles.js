import sequelize from './src/backend/config/database.js';

async function migrateRoles() {
    try {
        console.log('🚀 Starting Role Migration...');
        const [results, metadata] = await sequelize.query("UPDATE users SET role = 'customer' WHERE role = 'user'");
        console.log(`✅ Migration successful. Rows affected: ${metadata.rowCount || 'Check Sequelize metadata'}`);

        const [final] = await sequelize.query("SELECT role, count(*) FROM users GROUP BY role");
        console.table(final);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrateRoles();
