import { Store, User } from './src/backend/models/index.js';

async function fixBouttech() {
    try {
        const user = await User.findOne({ where: { email: 'john@example.com' } });
        const store = await Store.findOne({ where: { name: 'bouttech' } });

        if (!user || !store) {
            console.log('❌ User or store not found');
            process.exit(1);
        }

        console.log('👤 User:', user.name, user.email);

        const sampleIdentity = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // Update settings
        const settings = store.settings || {};
        settings.identityData = sampleIdentity;

        // Update store
        await store.update({
            user_id: user.id,
            settings: settings
        });

        console.log('✅ Store updated!');
        console.log('✅ user_id:', user.id);
        console.log('✅ identityData added');

        // Verify
        const updated = await Store.findOne({ where: { name: 'bouttech' } });
        console.log('\n📦 Verified:');
        console.log('user_id:', updated.user_id);
        console.log('Has identityData:', !!updated.settings?.identityData);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixBouttech();
