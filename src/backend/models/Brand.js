import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    logo_url: {
        type: DataTypes.TEXT
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Brand;
