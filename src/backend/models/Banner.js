import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    titleSize: {
        type: DataTypes.STRING,
        defaultValue: 'text-4xl'
    },
    titleWeight: {
        type: DataTypes.STRING,
        defaultValue: 'font-bold'
    },
    titleColor: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff'
    },
    subtitleColor: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff'
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    textAlign: {
        type: DataTypes.STRING,
        defaultValue: 'text-center' // 'text-left', 'text-center', 'text-right'
    },
    verticalAlign: {
        type: DataTypes.STRING,
        defaultValue: 'items-center' // 'items-start', 'items-center', 'items-end'
    },
    buttonText: {
        type: DataTypes.STRING,
        defaultValue: 'Découvrir'
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'banners'
});

export default Banner;
