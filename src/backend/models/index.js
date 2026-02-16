import sequelize from '../config/database.js';
import Product from './Product.js';
import User from './User.js';
import Address from './Address.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import OrderLog from './OrderLog.js';
import Category from './Category.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Brand from './Brand.js';
import Expense from './Expense.js';
import Newsletter from './Newsletter.js';
import Campaign from './Campaign.js';
import Page from './Page.js';
import BlogPost from './BlogPost.js';
import Role from './Role.js';
import Notification from './Notification.js';
import Review from './Review.js';
import Store from './Store.js';
import Payout from './Payout.js';
import Banner from './Banner.js';
import HomepageConfig from './HomepageConfig.js';
import Conversation from './Conversation.js';
import Message from './Message.js';

// Définir les associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order Logs associations
Order.hasMany(OrderLog, { foreignKey: 'order_id', as: 'logs' });
OrderLog.belongsTo(Order, { foreignKey: 'order_id' });

User.hasMany(OrderLog, { foreignKey: 'user_id', as: 'order_logs' });
OrderLog.belongsTo(User, { foreignKey: 'user_id', as: 'actor' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });

// Reviews associations
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Store associations
User.hasOne(Store, { foreignKey: 'userId', as: 'store' });
Store.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Store.hasMany(Product, { foreignKey: 'storeId', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Payout, { foreignKey: 'storeId', as: 'payouts' });
Payout.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

User.hasOne(Cart, { foreignKey: 'customerId' });
Cart.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Address associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Messaging associations
User.hasMany(Conversation, { foreignKey: 'participant1_id', as: 'conversations1' });
User.hasMany(Conversation, { foreignKey: 'participant2_id', as: 'conversations2' });
Conversation.belongsTo(User, { foreignKey: 'participant1_id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2_id', as: 'participant2' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sent_messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  Product,
  User,
  Address,
  Order,
  OrderItem,
  Category,
  Cart,
  CartItem,
  Brand,
  Expense,
  Newsletter,
  Campaign,
  Page,
  BlogPost,
  Role,
  Notification,
  Review,
  Store,
  Payout,
  OrderLog,
  Banner,
  HomepageConfig,
  Conversation,
  Message
};

export { Product, User, Address, Order, OrderItem, Category, Cart, CartItem, Brand, Expense, Newsletter, Campaign, Page, BlogPost, Role, Notification, Review, Store, Payout, OrderLog, Banner, HomepageConfig, Conversation, Message };
export default db;
