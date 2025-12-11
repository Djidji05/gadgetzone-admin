import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'info',
        comment: 'Type: info, success, warning, error, project, order, etc.'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('unread', 'read'),
        defaultValue: 'unread',
        allowNull: false
    },
    relatedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_id',
        comment: 'ID of related entity (order, product, etc.)'
    },
    relatedType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'related_type',
        comment: 'Type of related entity: order, product, user, etc.'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional data (user image, action details, etc.)'
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id', 'status']
        },
        {
            fields: ['created_at']
        }
    ]
});

export default Notification;
