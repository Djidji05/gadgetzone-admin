import sequelize from '../config/database.js';
import Role from '../models/Role.js';

async function createRolesTable() {
    try {
        console.log('🔄 Creating roles table...');

        await Role.sync({ force: false });

        console.log('✅ Roles table created successfully!');

        console.log('📝 Creating system roles...');

        await Role.bulkCreate([
            {
                name: 'Administrateur',
                description: 'Accès complet à toutes les fonctionnalités du système',
                permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_settings', 'manage_roles', 'view_analytics'],
                isSystem: true
            },
            {
                name: 'Éditeur',
                description: 'Peut gérer le contenu, les produits et les commandes',
                permissions: ['create', 'read', 'update', 'manage_content', 'manage_products', 'manage_orders'],
                isSystem: true
            },
            {
                name: 'Utilisateur',
                description: 'Accès en lecture seule aux fonctionnalités de base',
                permissions: ['read', 'view_own_profile'],
                isSystem: true
            }
        ]);

        console.log('✅ System roles created!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating roles table:', error);
        process.exit(1);
    }
}

createRolesTable();
