import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderLog = sequelize.define('OrderLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means system or unknown
    },
    action: {
        type: DataTypes.STRING, // 'created', 'status_change', 'payment', etc.
        allowNull: false
    },
    old_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    new_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'order_logs',
    timestamps: false
});

export default OrderLog;
