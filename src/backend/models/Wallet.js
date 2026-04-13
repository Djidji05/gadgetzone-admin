import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'store_id',
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    pending_balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Fonds en attente (commande non encore livrée/scannée)'
    },
    available_balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Fonds disponibles pour retrait'
    },
    total_earned: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Total historique gagné par le vendeur'
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'HTG'
    },
    last_payout_at: {
        type: DataTypes.DATE,
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
    tableName: 'wallets',
    timestamps: false
});

export default Wallet;
