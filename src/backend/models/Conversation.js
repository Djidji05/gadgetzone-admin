import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    participant1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'participant1_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    participant2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'participant2_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'last_message'
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_message_at'
    }
}, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true
});

export default Conversation;
