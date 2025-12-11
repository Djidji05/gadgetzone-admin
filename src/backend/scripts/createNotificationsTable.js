import sequelize from '../config/database.js';
import { Notification } from '../models/index.js';

/**
 * Script de migration pour créer la table notifications
 */
async function createNotificationsTable() {
    try {
        console.log('🔄 Création de la table notifications...');

        // Synchroniser le modèle Notification avec la base de données
        await Notification.sync({ force: false });

        console.log('✅ Table notifications créée avec succès');

        // Créer quelques notifications de test
        console.log('📝 Création de notifications de test...');

        const testNotifications = [
            {
                userId: 1, // Admin user
                type: 'info',
                title: 'Bienvenue sur GadgetZone',
                message: 'Votre système de notifications est maintenant opérationnel',
                status: 'unread'
            },
            {
                userId: 1,
                type: 'success',
                title: 'Système mis à jour',
                message: 'Le système de notifications a été configuré avec succès',
                status: 'unread'
            },
            {
                userId: 1,
                type: 'project',
                title: 'Nouvelle fonctionnalité',
                message: 'Les notifications sont maintenant connectées au backend',
                status: 'read'
            }
        ];

        for (const notif of testNotifications) {
            await Notification.create(notif);
        }

        console.log('✅ Notifications de test créées');
        console.log('🎉 Migration terminée avec succès');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

createNotificationsTable();
