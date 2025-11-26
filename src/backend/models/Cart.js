import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'abandoned', 'converted'),
    defaultValue: 'active'
  }
}, {
  tableName: 'carts',
  timestamps: true
});

export default Cart;
