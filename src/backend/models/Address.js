import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Rue and specific address'
    },
    quartier: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'District/Neighborhood'
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: 'Haïti'
    },
    whatsapp: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'WhatsApp Number'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'addresses',
    timestamps: true, // created_at, updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Address;
