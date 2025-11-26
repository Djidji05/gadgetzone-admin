import sequelize from '../config/database.js';
import Product from './Product.js';
import User from './User.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Category from './Category.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';

// Définir les associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

User.hasOne(Cart, { foreignKey: 'customerId' });
Cart.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  Product,
  User,
  Order,
  OrderItem,
  Category,
  Cart,
  CartItem
};

export { Product, User, Order, OrderItem, Category, Cart, CartItem };
export default db;
