import sequelize from './src/backend/config/database.js';
import { Store, User } from './src/backend/models/index.js';

async function updateStoresWithIdentity() {
    try {
        console.log('🔧 Updating stores with identity data...');

        // Sample base64 image (1x1 transparent PNG)
        const sampleIdentityImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        const stores = await Store.findAll();

        for (const store of stores) {
            const settings = store.settings || {};

            // Add identity data if not present
            if (!settings.identityData) {
                settings.identityData = sampleIdentityImage;
                store.settings = settings;
                await store.save();
                console.log(`✅ Added identity data to store: ${store.name}`);
            }
        }

        console.log('\n🎉 All stores updated with identity data!');

        // Test the API response
        console.log('\n📊 Testing API response format...');
        const testStore = await Store.findOne({
            include: [{
                model: User,
                as: 'owner',
                attributes: ['id', 'name', 'email', 'phone', 'role']
            }]
        });

        if (testStore) {
            console.log('Sample store data:');
            console.log(JSON.stringify(testStore.toJSON(), null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

updateStoresWithIdentity();
