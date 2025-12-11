import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System roles cannot be deleted'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'roles',
    timestamps: true
});

export default Role;
