import { Notification, User } from '../models/index.js';

/**
 * Utilitaire pour créer des notifications
 */

/**
 * Crée une notification pour un utilisateur spécifique
 * @param {number} userId - ID de l'utilisateur
 * @param {string} type - Type de notification (info, success, warning, error, project, order)
 * @param {string} title - Titre de la notification
 * @param {string} message - Message de la notification
 * @param {object} options - Options additionnelles (relatedId, relatedType, metadata)
 * @returns {Promise<Notification|null>}
 */
export async function createNotification(userId, type, title, message, options = {}) {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            status: 'unread',
            relatedId: options.relatedId || null,
            relatedType: options.relatedType || null,
            metadata: options.metadata || null
        });

        return notification;
    } catch (error) {
        // Ne pas bloquer le flux principal en cas d'erreur
        console.error('❌ Erreur création notification:', error);
        return null;
    }
}

/**
 * Notifie tous les administrateurs
 * @param {string} type - Type de notification
 * @param {string} title - Titre
 * @param {string} message - Message
 * @param {object} options - Options additionnelles
 * @returns {Promise<number>} Nombre de notifications créées
 */
export async function notifyAllAdmins(type, title, message, options = {}) {
    try {
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id']
        });

        let count = 0;
        for (const admin of admins) {
            const notif = await createNotification(admin.id, type, title, message, options);
            if (notif) count++;
        }

        console.log(`✅ ${count} admin(s) notifié(s): ${title}`);
        return count;
    } catch (error) {
        console.error('❌ Erreur notification admins:', error);
        return 0;
    }
}

/**
 * Notifie les utilisateurs d'un rôle spécifique
 * @param {string} role - Rôle (admin, gestionnaire, user)
 * @param {string} type - Type de notification
 * @param {string} title - Titre
 * @param {string} message - Message
 * @param {object} options - Options additionnelles
 * @returns {Promise<number>} Nombre de notifications créées
 */
export async function notifyByRole(role, type, title, message, options = {}) {
    try {
        const users = await User.findAll({
            where: { role },
            attributes: ['id']
        });

        let count = 0;
        for (const user of users) {
            const notif = await createNotification(user.id, type, title, message, options);
            if (notif) count++;
        }

        console.log(`✅ ${count} utilisateur(s) avec rôle "${role}" notifié(s): ${title}`);
        return count;
    } catch (error) {
        console.error(`❌ Erreur notification rôle ${role}:`, error);
        return 0;
    }
}

/**
 * Notifie pour une nouvelle commande
 * @param {object} order - Objet commande
 * @returns {Promise<number>}
 */
export async function notifyNewOrder(order) {
    const title = `Nouvelle commande #${order.id}`;
    const message = `Commande de ${order.user?.name || 'Client'} pour ${order.total_amount}€`;

    return await notifyAllAdmins('order', title, message, {
        relatedId: order.id,
        relatedType: 'order',
        metadata: {
            orderId: order.id,
            amount: order.total_amount,
            userId: order.user_id
        }
    });
}

/**
 * Notifie pour un changement de statut de commande
 * @param {object} order - Objet commande
 * @param {string} oldStatus - Ancien statut
 * @param {string} newStatus - Nouveau statut
 * @returns {Promise<number>}
 */
export async function notifyOrderStatusChange(order, oldStatus, newStatus) {
    const statusLabels = {
        pending: 'En attente',
        processing: 'En traitement',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée'
    };

    const title = `Commande #${order.id} - ${statusLabels[newStatus]}`;
    const message = `Statut changé de "${statusLabels[oldStatus]}" à "${statusLabels[newStatus]}"`;

    const type = newStatus === 'cancelled' ? 'warning' : 'info';

    return await notifyAllAdmins(type, title, message, {
        relatedId: order.id,
        relatedType: 'order',
        metadata: {
            orderId: order.id,
            oldStatus,
            newStatus
        }
    });
}

/**
 * Notifie pour un nouvel utilisateur système
 * @param {object} user - Objet utilisateur
 * @returns {Promise<number>}
 */
export async function notifyNewSystemUser(user) {
    const title = `Nouvel utilisateur système créé`;
    const message = `${user.name} (${user.email}) - Rôle: ${user.role}`;

    return await notifyAllAdmins('info', title, message, {
        relatedId: user.id,
        relatedType: 'user',
        metadata: {
            userId: user.id,
            userRole: user.role,
            userEmail: user.email
        }
    });
}

/**
 * Notifie pour un stock faible
 * @param {object} product - Objet produit
 * @returns {Promise<number>}
 */
export async function notifyLowStock(product) {
    const title = `⚠️ Stock faible: ${product.name}`;
    const message = `Il ne reste que ${product.stock} unité(s) en stock`;

    return await notifyAllAdmins('warning', title, message, {
        relatedId: product.id,
        relatedType: 'product',
        metadata: {
            productId: product.id,
            productName: product.name,
            stock: product.stock
        }
    });
}
