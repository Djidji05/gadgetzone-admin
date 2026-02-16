import { Store } from './src/backend/models/index.js';

async function addIdentityData() {
    try {
        const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        const stores = await Store.findAll();

        for (const store of stores) {
            const settings = store.settings || {};
            settings.identityData = sampleImage;

            await store.update({ settings });
            console.log(`✅ Updated ${store.name}`);
        }

        console.log('\n🎉 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addIdentityData();
