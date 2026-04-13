import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AcademyCourse = sequelize.define('AcademyCourse', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('video', 'article'),
        allowNull: false,
        defaultValue: 'video'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Débuter'
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    readTime: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('published', 'draft'),
        defaultValue: 'published'
    }
}, {
    tableName: 'academy_courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default AcademyCourse;
