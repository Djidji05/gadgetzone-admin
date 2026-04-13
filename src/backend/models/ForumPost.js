import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ForumPost extends Model { }

ForumPost.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'closed', 'deleted'),
        defaultValue: 'active'
    }
}, {
    sequelize,
    modelName: 'ForumPost',
    tableName: 'forum_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ForumPost;
