import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HomepageConfig = sequelize.define('HomepageConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    section: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Disabled to fix sync error
        comment: 'Generic identifier for the section (e.g., top_discovery, weather_picks, deals, promotions)'
    },
    content: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'homepage_configs'
});

export default HomepageConfig;
