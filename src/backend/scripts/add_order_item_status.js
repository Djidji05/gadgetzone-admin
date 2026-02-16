import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const addStatusColumn = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to DB');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('order_items');

        if (!tableInfo.status) {
            console.log('🔄 Adding status column to order_items...');
            await queryInterface.addColumn('order_items', 'status', {
                type: DataTypes.STRING,
                defaultValue: 'pending',
                allowNull: false
            });
            console.log('✅ Column added successfully');
        } else {
            console.log('ℹ️ Column status already exists');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

addStatusColumn();
