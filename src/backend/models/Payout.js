import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payout = sequelize.define('Payout', {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // 'pending', 'completed', 'failed'
        defaultValue: 'pending'
    },
    method: {
        type: DataTypes.STRING, // 'bank_transfer', 'moncash', 'check'
        allowNull: true
    },
    reference: {
        type: DataTypes.STRING, // Transaction ID or Check Number
        allowNull: true
    },
    adminNote: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'payouts',
    timestamps: false
});

export default Payout;
