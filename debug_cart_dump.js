
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Define minimal models to fetch data
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

// Associations
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

async function debugCart() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const carts = await Cart.findAll({
            include: [{
                model: CartItem,
                include: [Product]
            }]
        });

        console.log(`Found ${carts.length} carts.`);

        carts.forEach(cart => {
            console.log(`\nCart ID: ${cart.id} (Customer: ${cart.customerId})`);
            if (!cart.CartItems || cart.CartItems.length === 0) {
                console.log('  - Empty');
                return;
            }

            cart.CartItems.forEach(item => {
                const p = item.Product;
                if (!p) {
                    console.log(`  - Item ID ${item.id}: Product NOT FOUND (ID: ${item.productId})`);
                    return;
                }

                console.log(`  - Item ID ${item.id}, Product: ${p.id} (${p.name})`);
                console.log(`    > image_url: ${JSON.stringify(p.image_url)} (Type: ${typeof p.image_url})`);
                console.log(`    > images: ${JSON.stringify(p.images)} (Type: ${typeof p.images}, IsArray: ${Array.isArray(p.images)})`);

                // Simulate logic
                const logicResult = p.image_url || (p.images && p.images.length > 0 ? p.images[0] : null);
                console.log(`    > Logic Result: ${JSON.stringify(logicResult)}`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugCart();
