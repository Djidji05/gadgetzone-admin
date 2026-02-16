import sequelize from '../config/database.js';

async function fixDeliveredDates() {
    try {
        console.log("Fixing delivered dates for orders marked as delivered but with same created_at/updated_at...");

        // Find orders where status is 'delivered' and (delivered_at is null OR updated_at = created_at)
        // Set delivered_at and updated_at to NOW
        const [results] = await sequelize.query(`
            UPDATE orders 
            SET delivered_at = NOW(), 
                updated_at = NOW() 
            WHERE status = 'delivered' 
            AND (delivered_at IS NULL OR updated_at = created_at)
        `);

        console.log(`Updated delivered orders.`);
        process.exit(0);
    } catch (error) {
        console.error("Fix failed:", error);
        process.exit(1);
    }
}

fixDeliveredDates();
