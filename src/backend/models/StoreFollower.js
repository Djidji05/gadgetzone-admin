import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoreFollower = sequelize.define('StoreFollower', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'store_followers',
    timestamps: false
});

export default StoreFollower;
