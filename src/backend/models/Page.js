import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'pages',
    timestamps: true
});

export default Page;
