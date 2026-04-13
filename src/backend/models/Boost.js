import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Boost = sequelize.define('Boost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    package_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    startsAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'starts_at'
    },
    endsAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ends_at'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'boosts',
    timestamps: false
});

export default Boost;
