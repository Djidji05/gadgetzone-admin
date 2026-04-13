import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Promotion = sequelize.define('Promotion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    minAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    applicableProducts: {
        type: DataTypes.JSON, // Array of product IDs
        allowNull: true
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'promotions',
    timestamps: true,
    indexes: [
        {
            fields: ['isActive', 'startDate', 'endDate']
        },
        {
            fields: ['code']
        }
    ]
});

export default Promotion;
