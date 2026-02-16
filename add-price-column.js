import sequelize from './src/backend/config/database.js';

async function addPriceColumn() {
    try {
        console.log('🔧 Adding price column to products table...');

        // Add price column with default value 0
        await sequelize.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0
        `);

        console.log('✅ Column added');

        // Copy values from original_price to price
        await sequelize.query(`
            UPDATE products 
            SET price = COALESCE(original_price, 0)
            WHERE price IS NULL OR price = 0
        `);

        console.log('✅ Prices copied from original_price');

        // Verify
        const [result] = await sequelize.query(`
            SELECT COUNT(*) as total, 
                   COUNT(price) as with_price,
                   AVG(price) as avg_price
            FROM products
        `);

        console.log('\n📊 Verification:');
        console.log(`Total products: ${result[0].total}`);
        console.log(`Products with price: ${result[0].with_price}`);
        console.log(`Average price: ${parseFloat(result[0].avg_price).toFixed(2)}`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

addPriceColumn();
