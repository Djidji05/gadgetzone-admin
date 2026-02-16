import sequelize from '../config/database.js';

async function migrate() {
    try {
        console.log("Adding delivered_at column to orders table...");
        await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;');
        console.log("Done.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
