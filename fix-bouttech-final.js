import sequelize from './src/backend/config/database.js';

async function fixBouttech() {
    try {
        // Get current settings
        const [stores] = await sequelize.query(`SELECT settings FROM stores WHERE name = 'bouttech'`);
        const currentSettings = stores[0].settings || {};

        console.log('Current settings:', currentSettings);

        // Add identityData
        currentSettings.identityData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // Update with new settings
        await sequelize.query(`
            UPDATE stores 
            SET user_id = 2,
                settings = :settings
            WHERE name = 'bouttech'
        `, {
            replacements: {
                settings: JSON.stringify(currentSettings)
            }
        });

        console.log('✅ Updated successfully!');

        // Verify
        const [result] = await sequelize.query(`SELECT id, name, user_id, settings FROM stores WHERE name = 'bouttech'`);
        console.log('\n📦 Verified:');
        console.log(JSON.stringify(result[0], null, 2));

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

fixBouttech();
