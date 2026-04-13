import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'fas fa-tag'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 3.00,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: false,
  indexes: [
    { fields: ['parent_id'] },
    { fields: ['slug'] }
  ]
});

export default Category;
