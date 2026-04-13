import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Refund = sequelize.define('Refund', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    original_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Montant original de la commande'
    },
    fee_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Taux de frais en % (ex: 2.00 pour 2%)'
    },
    fee_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Montant des frais déduits'
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Montant net remboursé (original - frais)'
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Méthode de remboursement (MonCash, Natcash, Carte, etc.)'
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
    },
    reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Référence de transaction (ID MonCash, numéro virement, etc.)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes de l\'admin sur le remboursement'
    },
    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison de l\'échec si status = failed'
    },
    processed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        comment: 'ID de l\'admin qui a traité le remboursement'
    },
    processed_at: {
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
    tableName: 'refunds',
    timestamps: false,
    indexes: [
        { fields: ['order_id'] },
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
    ]
});

export default Refund;
