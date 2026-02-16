import sequelize from '../config/database.js';

async function checkOrderColumns() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(orders)");
        console.log("Columns in orders table:");
        results.forEach(col => console.log(`- ${col.name} (${col.type})`));
        process.exit(0);
    } catch (error) {
        console.error("Error checking columns:", error);
        process.exit(1);
    }
}

checkOrderColumns();
