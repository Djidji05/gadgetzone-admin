import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ForumComment extends Model { }

ForumComment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ForumComment',
    tableName: 'forum_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ForumComment;
