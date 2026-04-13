import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Referral = sequelize.define('Referral', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ambassador_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    referred_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    commission_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'paid', 'cancelled'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'referrals',
    timestamps: true,
    underscored: true
});

export default Referral;
