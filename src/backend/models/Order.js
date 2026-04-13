import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  shipping_address: {
    type: DataTypes.TEXT
  },
  shipping_coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{lat, lng}'
  },
  reference_point: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ex: Près de la station Total'
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    comment: 'Méthode de paiement utilisée (JSON stringifiée)'
  },

  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de transaction MonCash ou autre'
  },
  payment_token: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token de paiement temporaire MonCash'
  },
  payment_group_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Identifiant unique de groupe pour paiements multi-vendeurs'
  },
  seller_commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Taux de commission snapshot au moment du paiement'
  },
  seller_net_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: 'Montant net vendeur snapshot au moment du paiement'
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lien direct vers la boutique (Propriétaire de cette sous-commande)'
  },
  delivery_token: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Code secret unique pour validation de livraison par scan (OTP/QR)'
  },
  carrier_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nom du transporteur (ex: Nom du livreur privé ou DAP)'
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  delivery_proof_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de la photo de preuve de livraison'
  },
  delivery_note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: false,
  indexes: [
    { fields: ['status', 'created_at'] }, // 🚀 Index composé pour les stats temporelles
    { fields: ['user_id'] },
    { fields: ['store_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['delivery_token'] }
  ]
});

export default Order;
