import sequelize from '../config/database.js';

async function checkColumns() {
    try {
        const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
        const columns = results.map(r => r.column_name);
        console.log('Columns in orders table:', columns);

        const expected = ['payment_method', 'transaction_id', 'payment_token', 'cancelled_at', 'shipped_at', 'confirmed_at', 'delivered_at'];
        const missing = expected.filter(c => !columns.includes(c));

        if (missing.length > 0) {
            console.log('🚨 Missing columns:', missing);
        } else {
            console.log('✅ All expected columns are present.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking columns:', error);
        process.exit(1);
    }
}

checkColumns();
