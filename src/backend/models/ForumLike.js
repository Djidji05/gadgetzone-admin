import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ForumLike extends Model { }

ForumLike.init({
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
    }
}, {
    sequelize,
    modelName: 'ForumLike',
    tableName: 'forum_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ForumLike;
