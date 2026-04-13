import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'store_id',
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    condition: {
        type: DataTypes.STRING,
        defaultValue: 'new'
    },
    shipping_days_min: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'shipping_days_min'
    },
    shipping_days_max: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'shipping_days_max'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sales_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
    tableName: 'offers',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['product_id', 'is_active', 'stock', 'sales_count', 'price'],
            name: 'offers_buy_box_idx'
        }
    ]
});

export default Offer;
