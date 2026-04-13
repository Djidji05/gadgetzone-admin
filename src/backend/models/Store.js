import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bannerUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'suspended', 'closed'),
        defaultValue: 'pending'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One store per user
        field: 'user_id', // Map to snake_case column in database
        references: {
            model: 'users',
            key: 'id'
        }
    },
    settings: {
        type: DataTypes.JSON, // Store specific settings (colors, shipping policy, etc)
        defaultValue: {}
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    facebook: {
        type: DataTypes.STRING,
        allowNull: true
    },
    instagram: {
        type: DataTypes.STRING,
        allowNull: true
    },
    moncashNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'moncash_number'
    },
    natcashNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'natcash_number'
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10.00,
        allowNull: false
    },
    trust_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 100.00, // Démarre à 100%
        allowNull: false
    },
    total_sales_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    follower_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
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
    tableName: 'stores',
    timestamps: false,
    indexes: [
        { fields: ['status'] },
        { fields: ['user_id'] },
        { fields: ['latitude', 'longitude'] }
    ]
});

export default Store;
