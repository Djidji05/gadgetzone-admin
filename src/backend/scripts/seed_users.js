import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

/**
 * Script pour créer des utilisateurs de test dans la base de données
 */
async function seedUsers() {
    try {
        console.log('🌱 Création des utilisateurs de test...');

        const testUsers = [
            { name: 'Jean Dupont', email: 'jean@example.com', phone: '0123456789', role: 'user' },
            { name: 'Marie Martin', email: 'marie@example.com', phone: '0234567890', role: 'user' },
            { name: 'Pierre Durand', email: 'pierre@example.com', phone: '0345678901', role: 'user' },
            { name: 'Sophie Bernard', email: 'sophie@example.com', phone: '0456789012', role: 'user' },
            { name: 'Luc Petit', email: 'luc@example.com', phone: '0567890123', role: 'user' },
            { name: 'Claire Robert', email: 'claire@example.com', phone: '0678901234', role: 'user' },
            { name: 'Thomas Richard', email: 'thomas@example.com', phone: '0789012345', role: 'user' },
            { name: 'Emma Dubois', email: 'emma@example.com', phone: '0890123456', role: 'user' },
            { name: 'Lucas Moreau', email: 'lucas@example.com', phone: '0901234567', role: 'user' },
            { name: 'Chloé Laurent', email: 'chloe@example.com', phone: '0012345678', role: 'user' },
        ];

        const password = await bcrypt.hash('password123', 10);

        for (const userData of testUsers) {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ where: { email: userData.email } });

            if (!existingUser) {
                await User.create({
                    ...userData,
                    password
                });
                console.log(`✅ Utilisateur créé: ${userData.name} (${userData.email})`);
            } else {
                console.log(`⏭️  Utilisateur existe déjà: ${userData.name} (${userData.email})`);
            }
        }

        console.log('✅ Seed des utilisateurs terminé!');
        console.log(`📊 Total: ${testUsers.length} utilisateurs`);

    } catch (error) {
        console.error('❌ Erreur lors du seed des utilisateurs:', error);
        throw error;
    }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    seedUsers()
        .then(() => {
            console.log('✨ Script terminé avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

export default seedUsers;
