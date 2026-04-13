
import { User, Store, Product } from '../models/index.js';
import { closeConnection } from '../config/database.js';

async function fixOrphans() {
    try {
        console.log('--- Fixing Orphan Products ---');

        // 1. Find Admin User (usually ID 1)
        let admin = await User.findByPk(1);
        if (!admin) {
            console.log('User 1 not found, finding first admin...');
            admin = await User.findOne({ where: { role: 'admin' } });
        }

        if (!admin) {
            console.error('No admin found!');
            return;
        }

        console.log(`Found Admin: ${admin.id} (${admin.name})`);

        // 2. Find Admin's Store
        let store = await Store.findOne({ where: { userId: admin.id } });
        if (!store) {
            console.log('Admin has no store. Creating one...');
            store = await Store.create({
                name: "htfasil Official",
                description: "Official store for htfasil products",
                userId: admin.id,
                status: 'active',
                logo_url: '/images/logo.png',
                settings: {
                    address: 'htfasil HQ',
                    whatsapp: '+50900000000'
                }
            });
            console.log(`Created Store: ${store.id} (${store.name})`);
        } else {
            console.log(`Found Admin Store: ${store.id} (${store.name})`);
        }

        // 3. Update Orphan Products
        const [updatedCount] = await Product.update(
            { storeId: store.id },
            { where: { storeId: null } }
        );

        console.log(`Updated ${updatedCount} orphan products to belong to store ${store.id}.`);

    } catch (error) {
        console.error('Error fixing orphans:', error);
    } finally {
        await closeConnection();
    }
}

fixOrphans();
