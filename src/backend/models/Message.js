import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'conversation_id',
        references: {
            model: 'conversations',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['conversation_id'] },
        { fields: ['sender_id'] },
        { fields: ['is_read'] },
        { fields: ['created_at'] }
    ]
});

export default Message;
