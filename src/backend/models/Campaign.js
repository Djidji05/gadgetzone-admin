import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Email', 'Social Media', 'Newsletter', 'SMS', 'Display Ads', 'Other'),
        allowNull: false,
        defaultValue: 'Email'
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Active', 'Paused', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Draft'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    spent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    leads: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    conversions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    revenue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
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
    tableName: 'campaigns',
    timestamps: true
});

export default Campaign;
