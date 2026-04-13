import { Notification, User, Order, OrderItem, Product, Store, Dispute, DisputeMessage, sequelize } from '../models/index.js';
const { Op } = sequelize;
import { sendEmail } from '../services/emailService.js';
import { sendWhatsApp } from '../services/whatsappService.js';
import { notificationQueue, addJob } from '../config/queues.js';

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

        // Create notifications in parallel
        const promises = admins.map(admin =>
            createNotification(admin.id, type, title, message, options)
        );

        const results = await Promise.all(promises);
        const count = results.filter(n => n !== null).length;

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

        // Create notifications in parallel
        const promises = users.map(user =>
            createNotification(user.id, type, title, message, options)
        );

        const results = await Promise.all(promises);
        const count = results.filter(n => n !== null).length;

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
/**
 * Notifie pour une nouvelle commande
 * @param {object} order - Objet commande
 * @returns {Promise<number>}
 */
export async function notifyNewOrder(order) {
    const title = `Nouvelle commande #${order.order_number || order.id}`;
    const message = `Commande de ${order.user?.name || 'Client'} pour ${order.total_amount} HTG`;

    // 1. Offload Admin Notification to Queue (Async)
    await addJob(notificationQueue, 'admin-alert', {
        type: 'order',
        title,
        message,
        options: {
            relatedId: order.id,
            relatedType: 'order',
            metadata: {
                orderId: order.id,
                amount: order.total_amount,
                userId: order.user_id
            }
        }
    });

    // 2. Notification Externe (Client) - Still synchronously for legacy compatibility or move to queue later
    if (order.user) {
        // Email
        if (order.user.email) {
            const emailSubject = `Confirmation de commande #${order.order_number || order.id}`;
            const emailBody = `Bonjour ${order.user.name},\n\nVotre commande a bien été reçue.\nTotal: ${order.total_amount} HTG.\nMerci de votre confiance.`;
            sendEmail(order.user.email, emailSubject, emailBody);
        }

        // WhatsApp
        const phone = order.shipping_address?.phone || order.user.phone || order.user.whatsapp;
        if (phone) {
            const waMessage = `Bonjour ${order.user.name}, votre commande #${order.order_number || order.id} est confirmée. Total: ${order.total_amount} HTG.`;
            sendWhatsApp(phone, waMessage);
        }

        // 3. Persistent In-App Notification (Client)
        await createNotification(order.user_id, 'order', 'Commande reçue', `Votre commande #${order.order_number || order.id} a été bien reçue.`, {
            relatedId: order.id,
            relatedType: 'order'
        });
    }
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
        confirmed: 'Confirmée',
        processing: 'En traitement',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée'
    };

    const title = `Commande #${order.order_number || order.id} - ${statusLabels[newStatus]}`;
    const message = `Statut changé de "${statusLabels[oldStatus]}" à "${statusLabels[newStatus]}"`;

    const type = newStatus === 'cancelled' ? 'warning' : 'info';

    // 1. Notification Interne (Admin)
    await notifyAllAdmins(type, title, message, {
        relatedId: order.id,
        relatedType: 'order',
        metadata: {
            orderId: order.id,
            oldStatus,
            newStatus
        }
    });

    // 2. Notification Externe (Client) - Seulement si "delivered" (ou shipped/cancelled si souhaité)
    // Le client a demandé: "Quand la commande est livree"
    if (newStatus === 'delivered' && order.user) {
        // Email
        if (order.user.email) {
            const emailSubject = `Commande #${order.order_number || order.id} Livrée ! 🎁`;
            const emailBody = `Bonjour ${order.user.name},\n\nBonne nouvelle ! Votre commande a été livrée.\nMerci de faire vos achats chez nous.`;
            sendEmail(order.user.email, emailSubject, emailBody);
        }

        // WhatsApp
        const phone = order.shipping_address?.phone || order.user.phone || order.user.whatsapp;
        if (phone) {
            const waMessage = `Bonjour ${order.user.name}, votre commande #${order.order_number || order.id} a été livrée ! 🎁 Merci !`;
            sendWhatsApp(phone, waMessage);
        }
    }

    // 3. Persistent In-App Notification (Client) - Pour tout changement important
    if (order.user_id) {
        await createNotification(order.user_id, type === 'warning' ? 'warning' : 'order', title, message, {
            relatedId: order.id,
            relatedType: 'order'
        });
    }

    return 1;
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

/**
 * Notifie pour une nouvelle candidature vendeur
 * @param {object} store - Objet store (candidature)
 * @param {object} user - Objet utilisateur qui a soumis la candidature
 * @returns {Promise<number>}
 */
export async function notifyNewVendorApplication(store, user) {
    const title = `🏪 Nouvelle candidature vendeur`;
    const message = `${user.name} souhaite ouvrir une boutique "${store.name}"`;

    return await notifyAllAdmins('vendor_application', title, message, {
        relatedId: store.id,
        relatedType: 'store',
        metadata: {
            storeId: store.id,
            storeName: store.name,
            userId: user.id,
            userName: user.name,
            userEmail: user.email
        }
    });
}

/**
 * Notifie pour un nouveau litige
 * @param {object} dispute - Objet litige
 */
export async function notifyNewDispute(dispute) {
    try {
        // 1. Trouver les vendeurs concernés par la commande
        const orderItems = await OrderItem.findAll({
            where: { order_id: dispute.order_id },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['storeId'],
                include: [{
                    model: Store,
                    as: 'store',
                    include: [{ model: User, as: 'owner', attributes: ['id'] }]
                }]
            }]
        });

        const storeOwners = orderItems
            .map(item => item.product?.store?.owner)
            .filter((owner, index, self) => owner && self.findIndex(o => o.id === owner.id) === index);

        for (const owner of storeOwners) {
            await createNotification(owner.id, 'warning', 'Nouveau litige ouvert', `Un litige a été ouvert pour la commande #${dispute.order_id}`, {
                relatedId: dispute.id,
                relatedType: 'dispute'
            });
        }

        // 2. Notifier les admins
        await notifyAllAdmins('info', `Nouveau litige #${dispute.id}`, `Un litige a été ouvert pour la commande #${dispute.order_id}`, {
            relatedId: dispute.id,
            relatedType: 'dispute'
        });
    } catch (error) {
        console.error('❌ Erreur notification nouveau litige:', error);
    }
}

/**
 * Notifie pour un nouveau message dans un litige
 * @param {object} dispute - Objet litige
 * @param {object} message - Objet message
 */
export async function notifyNewDisputeMessage(dispute, message) {
    try {
        const isCustomer = message.sender_id === dispute.user_id;

        if (isCustomer) {
            // Client a écrit -> Notifier Vendeur (si pas déjà fait par l'admin) + Admin
            const orderItems = await OrderItem.findAll({
                where: { order_id: dispute.order_id },
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['storeId'],
                    include: [{
                        model: Store,
                        as: 'store',
                        include: [{ model: User, as: 'owner', attributes: ['id'] }]
                    }]
                }]
            });

            const storeOwners = orderItems
                .map(item => item.product?.store?.owner)
                .filter((owner, index, self) => owner && self.findIndex(o => o.id === owner.id) === index);

            for (const owner of storeOwners) {
                await createNotification(owner.id, 'info', 'Message Client (Litige)', `Nouveau message pour le litige #${dispute.id}`, {
                    relatedId: dispute.id,
                    relatedType: 'dispute'
                });
            }

            await notifyAllAdmins('info', `Nouveau message litige #${dispute.id}`, `Le client a envoyé un message pour le litige #${dispute.id}`, {
                relatedId: dispute.id,
                relatedType: 'dispute'
            });
        } else {
            // Admin ou Vendeur a écrit -> Notifier Client
            await createNotification(dispute.user_id, 'info', 'Réponse à votre litige', `Une réponse a été apportée à votre litige #${dispute.id}`, {
                relatedId: dispute.id,
                relatedType: 'dispute'
            });
        }
    } catch (error) {
        console.error('❌ Erreur notification message litige:', error);
    }
}

/**
 * Vérifie les litiges sans réponse du vendeur depuis 24h
 */
export async function checkStaleDisputes() {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Trouver les litiges ouverts il y a plus de 24h
        const oldDisputes = await Dispute.findAll({
            where: {
                status: { [Op.in]: ['pending', 'under_review'] },
                created_at: { [Op.lt]: twentyFourHoursAgo }
            },
            include: [
                {
                    model: DisputeMessage,
                    as: 'messages',
                    separate: true,
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ]
        });

        for (const dispute of oldDisputes) {
            const lastMessage = dispute.messages[0];

            // On alerte si :
            // 1. Pas de message du tout (le litige a > 24h)
            // 2. Le dernier message vient du client et il a > 24h
            let shouldAlert = false;

            if (!lastMessage) {
                shouldAlert = true;
            } else if (lastMessage.sender_id === dispute.user_id) {
                const lastMsgDate = new Date(lastMessage.created_at);
                if (lastMsgDate < twentyFourHoursAgo) {
                    shouldAlert = true;
                }
            }

            if (shouldAlert) {
                await notifyAllAdmins('error', `⚠️ Litige sans réponse : #${dispute.id}`, `Le vendeur n'a pas répondu au litige #${dispute.id} depuis plus de 24h.`, {
                    relatedId: dispute.id,
                    relatedType: 'dispute'
                });
            }
        }
    } catch (error) {
        console.error('❌ Erreur vérification litiges stagnants:', error);
    }
}
