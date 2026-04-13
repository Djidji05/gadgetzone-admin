import Product from './src/backend/models/Product.js';
import { Cart, CartItem } from './src/backend/models/index.js';

// Check product description
const p = await Product.findOne({ where: { name: 'Laptop nimo' }, attributes: ['id', 'name', 'description'] });
console.log('Product 12 from DB:', JSON.stringify(p?.toJSON()));

// Check cart item joined with product
const cart = await Cart.findOne({
  include: [{
    model: CartItem,
    include: [{ model: Product, attributes: ['id', 'name', 'description'] }]
  }]
});
if (cart?.CartItems?.length > 0) {
  console.log('Cart item product:', JSON.stringify(cart.CartItems[0].Product?.toJSON()));
} else {
  console.log('No cart items found');
}
process.exit(0);
