
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'gadgetzone',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);

/* Define Models */
const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER }
}, { tableName: 'carts', timestamps: true });

const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cartId: { type: DataTypes.INTEGER },
    productId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER }
}, { tableName: 'cart_items', timestamps: true });

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) },
    image_url: { type: DataTypes.TEXT },
    images: { type: DataTypes.JSON }
}, { tableName: 'products', timestamps: false });

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

async function analyze() {
    const logStream = fs.createWriteStream('cart_analysis_result.txt');

    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    try {
        log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT || 5432} / DB: ${process.env.DB_NAME} as ${process.env.DB_USER}`);

        await sequelize.authenticate();
        log('Connected to DB.');

        // Step 1: List all tables
        const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
        log('Available Tables: ' + JSON.stringify(results.map(r => r.table_name), null, 2));

        // Step 1.5: Count products
        try {
            const [prodCount] = await sequelize.query('SELECT count(*) as c FROM products');
            log('Product Count: ' + prodCount[0].c);
        } catch (e) { log('Error counting products: ' + e.message); }

        // Step 2: Try raw query on carts
        try {
            log('Attempting raw SELECT on "carts"...');
            const [rawCarts] = await sequelize.query('SELECT * FROM "carts" LIMIT 1');
            log('Raw query success. Rows: ' + rawCarts.length);
        } catch (e) {
            log('Raw query on "carts" failed: ' + e.message);
        }

        try {
            log('Attempting raw SELECT on "Cart"...');
            const [rawCart] = await sequelize.query('SELECT * FROM "Cart" LIMIT 1');
            log('Raw query success. Rows: ' + rawCart.length);
        } catch (e) {
            log('Raw query on "Cart" failed: ' + e.message);
        }

        // Step 3: Try to fetch carts via Model
        try {
            const carts = await Cart.findAll({
                include: [{
                    model: CartItem,
                    include: [Product]
                }]
            });

            log(`Found ${carts.length} carts via Model.`);

            carts.forEach(cart => {
                log(`\nCart ID: ${cart.id} (Customer: ${cart.customerId})`);
                if (!cart.CartItems || cart.CartItems.length === 0) {
                    log('  - Empty');
                    return;
                }

                cart.CartItems.forEach(item => {
                    const p = item.Product;
                    if (!p) {
                        log(`  - Item ID ${item.id}: Product NOT FOUND`);
                        return;
                    }

                    log(`  - Item ID ${item.id}, Product: ${p.id} (${p.name})`);
                    log(`    > image_url: ${JSON.stringify(p.image_url)} (Type: ${typeof p.image_url})`);
                    log(`    > images: ${JSON.stringify(p.images)} (Type: ${typeof p.images}, IsArray: ${Array.isArray(p.images)})`);

                    const logicResult = p.image_url || (p.images && p.images.length > 0 ? p.images[0] : null);
                    log(`    > Logic Result: ${JSON.stringify(logicResult)}`);
                });
            });
        } catch (e) {
            log('Error querying carts via Model: ' + e.message);
        }

    } catch (error) {
        log('Error: ' + error.message);
    } finally {
        await sequelize.close();
        logStream.end();
    }
}

analyze();
