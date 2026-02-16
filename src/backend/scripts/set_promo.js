import { Product } from '../models/index.js';
import { initDatabase, closeConnection } from '../config/database.js';

const setPromo = async () => {
    await initDatabase();

    try {
        const product = await Product.findOne();
        if (product) {
            console.log(`Setting promo on: ${product.name} (ID: ${product.id}), Price: ${product.price}`);
            // Set original price higher than current price
            const originalPrice = parseFloat(product.price) * 1.2;
            await product.update({ original_price: originalPrice });
            console.log(`Updated original_price to: ${originalPrice}`);
        } else {
            console.log('No products found in database');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await closeConnection();
    }
};

setPromo();
