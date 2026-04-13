import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modèle OrderTracking (Phase 13)
 * Stocke l'historique détaillé des étapes de livraison pour chaque commande.
 */
const OrderTracking = sequelize.define('OrderTracking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Ex: picked_up, in_transit, at_hub, out_for_delivery, delivered, delivery_failed'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Détails de l\'étape (ex: Arrivé au dépôt de Delmas 33)'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ville ou coordonnées GPS de l\'événement'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'order_trackings',
    timestamps: false,
    indexes: [
        { fields: ['order_id'] },
        { fields: ['status'] }
    ]
});

export default OrderTracking;
