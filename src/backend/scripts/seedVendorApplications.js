import sequelize from '../config/database.js';
import { Store, User } from '../models/index.js';
import { notifyNewVendorApplication } from '../utils/notificationHelper.js';

/**
 * Script pour créer des candidatures vendeur de test
 */
async function seedVendorApplications() {
    try {
        console.log('🌱 Démarrage du seeding des candidatures vendeur...');

        // Sync database
        await sequelize.sync();

        // Get some existing users (non-admin users to become vendors)
        const users = await User.findAll({
            where: { role: 'user' },
            limit: 5
        });

        if (users.length === 0) {
            console.log('❌ Aucun utilisateur trouvé. Créez d\'abord des utilisateurs.');
            return;
        }

        console.log(`✅ ${users.length} utilisateurs trouvés`);

        // Sample vendor applications
        const vendorApplications = [
            {
                name: 'TechGadgets Pro',
                description: 'Boutique spécialisée en accessoires technologiques haut de gamme',
                status: 'pending',
                settings: {
                    businessType: 'SARL',
                    taxId: 'NIF-2024-001',
                    address: 'Port-au-Prince, Delmas 33',
                    whatsapp: '+509 3456 7890',
                    productStyle: 'Electronics & Accessories'
                }
            },
            {
                name: 'Fashion Hub Haiti',
                description: 'Vêtements et accessoires de mode pour hommes et femmes',
                status: 'pending',
                settings: {
                    businessType: 'Entreprise Individuelle',
                    taxId: 'NIF-2024-002',
                    address: 'Port-au-Prince, Pétion-Ville',
                    whatsapp: '+509 4567 8901',
                    productStyle: 'Fashion & Clothing'
                }
            },
            {
                name: 'Home Decor Paradise',
                description: 'Articles de décoration pour la maison et le bureau',
                status: 'active',
                settings: {
                    businessType: 'SARL',
                    taxId: 'NIF-2024-003',
                    address: 'Cap-Haïtien, Centre-ville',
                    whatsapp: '+509 5678 9012',
                    productStyle: 'Home & Garden'
                }
            },
            {
                name: 'Sports & Fitness Store',
                description: 'Équipements sportifs et articles de fitness',
                status: 'pending',
                settings: {
                    businessType: 'SA',
                    taxId: 'NIF-2024-004',
                    address: 'Les Cayes, Rue Principale',
                    whatsapp: '+509 6789 0123',
                    productStyle: 'Sports & Outdoors'
                }
            },
            {
                name: 'Beauty & Cosmetics',
                description: 'Produits de beauté et cosmétiques de qualité',
                status: 'suspended',
                settings: {
                    businessType: 'Entreprise Individuelle',
                    taxId: 'NIF-2024-005',
                    address: 'Jacmel, Avenue de la Liberté',
                    whatsapp: '+509 7890 1234',
                    productStyle: 'Beauty & Personal Care'
                }
            }
        ];

        let createdCount = 0;
        let notificationCount = 0;

        for (let i = 0; i < Math.min(users.length, vendorApplications.length); i++) {
            const user = users[i];
            const appData = vendorApplications[i];

            // Check if user already has a store
            const existingStore = await Store.findOne({ where: { userId: user.id } });
            if (existingStore) {
                console.log(`⚠️  L'utilisateur ${user.name} a déjà une boutique`);
                continue;
            }

            // Create store
            const store = await Store.create({
                ...appData,
                userId: user.id
            });

            createdCount++;
            console.log(`✅ Boutique créée: ${store.name} (${store.status}) pour ${user.name}`);

            // Create notification for pending applications
            if (store.status === 'pending') {
                try {
                    await notifyNewVendorApplication(store, user);
                    notificationCount++;
                    console.log(`   📧 Notification envoyée aux admins`);
                } catch (error) {
                    console.error(`   ❌ Erreur notification:`, error.message);
                }
            }

            // Update user role if store is active
            if (store.status === 'active' && user.role !== 'seller') {
                user.role = 'seller';
                await user.save();
                console.log(`   👤 Rôle de ${user.name} changé en 'seller'`);
            }
        }

        console.log('\n📊 Résumé:');
        console.log(`   - ${createdCount} candidatures créées`);
        console.log(`   - ${notificationCount} notifications envoyées`);
        console.log('\n✅ Seeding terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the seeder
seedVendorApplications()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
