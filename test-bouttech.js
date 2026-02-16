import { Store, User } from './src/backend/models/index.js';

async function testBouttech() {
    try {
        const store = await Store.findOne({
            where: { name: 'bouttech' }
        });

        if (!store) {
            console.log('❌ Store bouttech not found');
            process.exit(1);
        }

        console.log('📦 Store data:');
        console.log(JSON.stringify(store.toJSON(), null, 2));

        console.log('\n👤 Fetching owner with user_id:', store.user_id);

        const owner = await User.findByPk(store.user_id);

        if (owner) {
            console.log('\n✅ Owner found:');
            console.log(JSON.stringify(owner.toJSON(), null, 2));
        } else {
            console.log('\n❌ Owner not found for user_id:', store.user_id);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testBouttech();
