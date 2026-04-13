import BaseService from './BaseService.js';
import OrderRepository from '../repositories/OrderRepository.js';
import { Order, Product, User, Referral, OrderLog, Offer, Store, Wallet, OrderItem, OrderTracking, sequelize } from '../models/index.js';
import { notifyNewOrder, notifyOrderStatusChange } from '../utils/notificationHelper.js';
import TrustScoreService from './TrustScoreService.js';
import crypto from 'crypto';

export default class OrderService extends BaseService {
    constructor() {
        const repository = new OrderRepository();
        super(repository);
    }

    async getMyOrders(userId, options) {
        return await this.repository.findByUser(userId, options);
    }

    async getOrderDetails(id) {
        return await this.repository.findDetailed(id);
    }

    async createOrder(data) {
        console.log('📝 OrderService.createOrder: Processing payload', JSON.stringify(data, null, 2));
        const { user_id, items, shipping_address, shipping_coordinates, reference_point, referral_code, payment_method } = data;


        return await sequelize.transaction(async (t) => {
            const user = await User.findByPk(user_id, { transaction: t });
            if (!user) throw new Error('User not found');

            // 1. Fetch products & Validate Stock
            const itemsWithOffers = [];
            for (const item of items) {
                // 🛡️ SÉCURITÉ : Bloquer les quantités négatives ou nulles (Vecteur de Vol)
                if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                    throw new Error(`Quantité invalide pour le produit ${item.product_id}. La quantité doit être un nombre entier positif.`);
                }

                // 🛡️ RECHERCHE DE L'OFFRE (Source de vérité pour le prix et la boutique)
                let offerId = item.offerId || item.offer_id || item.id;
                let offer = offerId ? await Offer.findByPk(offerId, { transaction: t }) : null;

                if (!offer) {
                    console.log(`⚠️ Offre non spécifiée ou introuvable pour le produit ${item.product_id}. Recherche d'une offre par défaut...`);
                    offer = await Offer.findOne({ 
                        where: { productId: item.product_id || item.productId },
                        transaction: t 
                    });
                }

                if (!offer) {
                    throw new Error(`Aucune offre (même par défaut) n'a pu être trouvée pour l'article ${item.product_id || item.productId}`);
                }


                const product = await Product.findByPk(item.product_id, { transaction: t });
                if (!product) throw new Error(`Produit ${item.product_id} introuvable`);

                // 🛡️ SÉCURITÉ : Vérifier l'intégrité de l'offre
                if (offer.productId !== product.id) {
                    throw new Error(`Incohérence détectée : L'offre ${offer.id} ne correspond pas au produit ${product.id}.`);
                }

                itemsWithOffers.push({
                    ...item,
                    offer,
                    product,
                    price: offer.price,
                    storeId: offer.storeId // Source de vérité (DB) pour le groupement par boutique
                });
            }

            // 2. Group by Store
            const itemsByStore = {};
            for (const item of itemsWithOffers) {
                const storeId = item.storeId;
                if (!itemsByStore[storeId]) itemsByStore[storeId] = [];
                itemsByStore[storeId].push({
                    product_id: item.product_id,
                    offer_id: item.offer.id,
                    quantity: item.quantity,
                    price: item.price
                });
            }

            // 3. Create orders per store
            const ambassador = referral_code ? await User.findOne({ where: { referral_code, is_ambassador: true }, transaction: t }) : null;
            const createdOrders = [];
            const groupPaymentToken = `GRP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            for (const storeId in itemsByStore) {
                const storeItems = itemsByStore[storeId];
                let subtotalAmount = storeItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

                const shippingFee = subtotalAmount > 5000 ? 0 : 250;

                let monCashFee = 0;
                if (payment_method && payment_method.type === 'moncashwise') {
                    const amountForFee = subtotalAmount + shippingFee;
                    if (amountForFee >= 20 && amountForFee <= 99) monCashFee = 7;
                    else if (amountForFee <= 249) monCashFee = 14;
                    else if (amountForFee <= 499) monCashFee = 19;
                    else if (amountForFee <= 999) monCashFee = 30;
                    else if (amountForFee <= 1999) monCashFee = 60;
                    else if (amountForFee <= 3999) monCashFee = 105;
                    else if (amountForFee <= 7999) monCashFee = 171;
                    else if (amountForFee <= 11999) monCashFee = 247;
                    else if (amountForFee <= 19999) monCashFee = 366;
                    else if (amountForFee <= 39999) monCashFee = 629;
                    else if (amountForFee <= 59999) monCashFee = 1011;
                    else if (amountForFee >= 60000) monCashFee = 1368;
                }

                const store = await Store.findByPk(storeId, { transaction: t });
                const commissionRate = store ? Number(store.commission_rate || 5) : 5; // Par défaut 5%
                const sellerNetAmount = Math.round(subtotalAmount * (1 - (commissionRate / 100)));
                const totalAmount = subtotalAmount + shippingFee + monCashFee;
                const roundedTotal = Math.round(totalAmount);
                const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                const order = await this.repository.createWithItems({
                    user_id,
                    store_id: Number(storeId), // 🏷️ Attribution directe de la boutique (Phase 13)
                    total_amount: roundedTotal,
                    status: 'payment_pending',
                    order_number: orderNumber,
                    delivery_token: crypto.randomBytes(8).toString('hex').toUpperCase(), // 🔑 Jeton unique pour Scan-to-Confirm
                    seller_commission_rate: commissionRate,
                    seller_net_amount: sellerNetAmount,
                    shipping_address: typeof shipping_address === 'object' ? JSON.stringify(shipping_address) : shipping_address,
                    shipping_coordinates: shipping_coordinates || null,
                    reference_point: reference_point || null,
                    payment_method: payment_method ? JSON.stringify(payment_method) : null,
                    payment_group_id: groupPaymentToken // 🔗 Lien permanent multi-vendeurs
                }, storeItems, { transaction: t });

                // Referral commission (Initialisation en attente de paiement)
                if (ambassador && ambassador.id !== user_id) {
                    await Referral.create({
                        ambassador_id: ambassador.id,
                        referred_user_id: user_id,
                        order_id: order.id,
                        commission_amount: totalAmount * 0.05,
                        status: 'pending'
                    }, { transaction: t });
                }

                createdOrders.push(order);
            }

            return {
                id: createdOrders[0].id,
                orderIds: createdOrders.map(o => o.id),
                totalOrders: createdOrders.length,
                totalAmount: createdOrders.reduce((acc, o) => acc + Number(o.total_amount), 0)
            };
        });
    }

    async updateStatus(id, newStatus, userId) {
        return await sequelize.transaction(async (t) => {
            // 🔒 VERROUILLAGE ATOMIQUE : Bloquer la ligne en base jusqu'à la fin de la transaction.
            const order = await Order.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!order) throw new Error('Order not found');

            // 🛡️ SÉCURITÉ SCAN-TO-CONFIRM : Interdire le passage manuel à 'delivered'
            // Cette transition ne DOIT se faire que via le scan du code QR client.
            if (newStatus === 'delivered') {
                throw new Error('La transition vers "Livré" nécessite obligatoirement la validation par scan du code client.');
            }

            const oldStatus = order.status;
            if (oldStatus === newStatus) return order;

            // 🛡️ PROTECTION PAIEMENT INTÉGRAL: 
            if (newStatus === 'confirmed' && !order.transaction_id) {
                throw new Error('Action refusée : Impossible de confirmer la commande sans une validation de paiement MonCash (ID de transaction manquant).');
            }

            // 🛡️ PROTECTION FLUX LOGISTIQUE :
            if ((newStatus === 'shipped' || newStatus === 'delivered') && (oldStatus === 'payment_pending' || oldStatus === 'pending')) {
                throw new Error(`Action refusée : Impossible de passer au statut '${newStatus}' car la commande n'a pas encore été confirmée par un paiement.`);
            }

            const updated = await order.update({
                status: newStatus,
                confirmed_at: newStatus === 'confirmed' ? new Date() : order.confirmed_at,
                shipped_at: newStatus === 'shipped' ? new Date() : order.shipped_at,
                delivered_at: newStatus === 'delivered' ? new Date() : order.delivered_at
            }, { transaction: t });

            await OrderLog.create({
                order_id: id,
                user_id: userId,
                action: 'status_change',
                old_status: oldStatus,
                new_status: newStatus,
                details: `Status changed from ${oldStatus} to ${newStatus}`
            }, { transaction: t });

            // ⚖️ LOGIQUE FINANCIÈRE (Incorpée pour intégrité totale)
            if (newStatus === 'delivered') {
                const items = await OrderItem.findAll({ 
                    where: { order_id: id },
                    include: [{ model: Product, as: 'product' }],
                    transaction: t
                });
                
                if (items.length > 0) {
                    const storeId = items[0].product.storeId;
                    const store = await Store.findByPk(storeId, { transaction: t });
                    
                    if (store) {
                        // 💸 UTILISATION DU SNAPSHOT : On utilise le montant net figé lors du paiement
                        // pour garantir la cohérence financière, même si les taux de la boutique changent.
                        const netAmount = Number(order.seller_net_amount) > 0 
                            ? Number(order.seller_net_amount) 
                            : (items.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0) * (1 - Number(store.commission_rate) / 100));

                        const [wallet] = await Wallet.findOrCreate({ 
                            where: { storeId },
                            defaults: { available_balance: 0, pending_balance: 0 },
                            transaction: t
                        });

                        // 🔄 TRANSFERT : Libération des fonds (Pending -> Available)
                        await wallet.decrement('pending_balance', { by: netAmount, transaction: t });
                        await wallet.increment('available_balance', { by: netAmount, transaction: t });
                        await wallet.increment('total_earned', { by: netAmount, transaction: t });
                        
                        // Action asynchrone sécurisée car le score n'est pas critique pour la finance
                        setImmediate(() => TrustScoreService.calculateStoreScore(storeId).catch(console.error));
                    }
                }
            }

            notifyOrderStatusChange(updated, oldStatus, newStatus).catch(console.error);
            return updated;
        });
    }

    async cancelOrder(id, userId, role) {
        const order = await this.getOrderDetails(id);
        if (!order) throw new Error('Order not found');
        if (order.user_id !== userId && role !== 'admin') throw new Error('Unauthorized');
        // Autoriser l'annulation si la commande n'est pas encore expédiée ou livrée
        const cancellableStatuses = ['payment_pending', 'pending', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            throw new Error(`Impossible d'annuler une commande au statut '${order.status}'.`);
        }

        return await sequelize.transaction(async (t) => {
            for (const item of order.items) {
                await Product.increment('stock', { where: { id: item.product_id }, by: item.quantity, transaction: t });
                
                // 📦 RÉAPPROVISIONNEMENT DU STOCK VENDEUR (OFFRE)
                if (item.offer_id) {
                    await Offer.increment('stock', { where: { id: item.offer_id }, by: item.quantity, transaction: t });
                }
            }

            // 🚫 ANNULER LES COMMISSIONS DE PARRAINAGE
            await Referral.update({ status: 'cancelled' }, { where: { order_id: id }, transaction: t });

            // 💸 RÉVERSION FINANCIÈRE (Pending Balance)
            if (oldStatus === 'confirmed') {
                const orderItems = await OrderItem.findAll({ 
                    where: { order_id: id },
                    include: [{ model: Product, as: 'product' }],
                    transaction: t
                });
                
                if (orderItems.length > 0) {
                    const storeId = orderItems[0].product.storeId;
                    const wallet = await Wallet.findOne({ where: { storeId }, transaction: t });
                    
                    if (wallet) {
                        // 💸 RÉVERSION VIA SNAPSHOT : On utilise le montant net enregistré
                        const netToRevert = Number(order.seller_net_amount) > 0
                            ? Number(order.seller_net_amount)
                            : (orderItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0) * (1 - (order.seller_commission_rate || 0)/100));

                        // 🛡️ SÉCURITÉ PENDING : Vérifier que le solde est suffisant pour annuler
                        if (Number(wallet.pending_balance) < netToRevert) {
                            console.warn(`⚠️ Nettoyage financier : Solde en attente insuffisant pour l'ordre #${id}. Mise à zéro du solde au lieu d'un débit négatif.`);
                            await wallet.update({ pending_balance: 0 }, { transaction: t });
                        } else {
                            await wallet.decrement('pending_balance', { by: netToRevert, transaction: t });
                        }
                    }
                }
            }

            const oldStatus = order.status;
            const updated = await order.update({ status: 'cancelled' }, { transaction: t });

            await OrderLog.create({
                order_id: id,
                user_id: userId,
                action: 'cancelled',
                old_status: oldStatus,
                new_status: 'cancelled',
                details: 'Order cancelled by user/admin. Stock and Referral reverted.'
            }, { transaction: t });

            notifyOrderStatusChange(updated, 'pending', 'cancelled').catch(console.error);
            return updated;
        });
    }

    /**
     * Valide la livraison via leScan du Jeton Client (Phase 13 - Scan-to-Confirm)
     * Déclenche automatiquement le paiement du vendeur.
     */
    async verifyDeliveryScan(id, token, actorId) {
        return await sequelize.transaction(async (t) => {
            const order = await Order.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!order) throw new Error('Commande introuvable.');

            // 1. Vérification du jeton
            if (order.delivery_token !== token.trim().toUpperCase()) {
                throw new Error('Code de livraison invalide.');
            }

            // 2. Vérification d'autorisation (Vendeur assigné ou Admin)
            const actor = await User.findByPk(actorId, { include: ['store'], transaction: t });
            const isOwner = actor.store && actor.store.id === order.store_id;
            const isAdmin = actor.role === 'admin';

            if (!isOwner && !isAdmin) {
                throw new Error('Accès refusé : Seul le vendeur de cette commande peut valider la livraison.');
            }

            // 3. Validation de l'état actuel
            if (order.status !== 'shipped' && order.status !== 'confirmed') {
                throw new Error(`La commande doit être en statut "Expédiée" pour être validée (Statut actuel : ${order.status}).`);
            }

            // 4. Exécuter la transition vers Delivered
            const oldStatus = order.status;
            await order.update({
                status: 'delivered',
                delivered_at: new Date()
            }, { transaction: t });

            // 5. Création du log de suivi (Tracking history)
            await OrderTracking.create({
                order_id: id,
                status: 'delivered',
                description: 'Livraison confirmée par scan du code client.',
                location: 'Point de remise'
            }, { transaction: t });

            // ⚖️ LOGIQUE FINANCIÈRE : Libération des fonds (Pending -> Available)
            // Comme l'ordre est déjà divisé par vendeur, on crédite la totalité du net vendeur snapshot.
            const [wallet] = await Wallet.findOrCreate({ 
                where: { storeId: order.store_id },
                defaults: { available_balance: 0, pending_balance: 0 },
                transaction: t 
            });

            if (wallet) {
                const netAmount = Number(order.seller_net_amount);
                console.log(`💰 Crédit portefeuille SIM : ${netAmount} G pour la boutique ${order.store_id}`);
                
                // On décrémente le pending (si positif) et on incrémente l'available
                // Note: En mode "Scan", on fait une libération atomique.
                await wallet.decrement('pending_balance', { by: netAmount, transaction: t });
                await wallet.increment('available_balance', { by: netAmount, transaction: t });
                await wallet.increment('total_earned', { by: netAmount, transaction: t });
                
                setImmediate(() => TrustScoreService.calculateStoreScore(order.store_id).catch(console.error));
            }

            notifyOrderStatusChange(order, oldStatus, 'delivered').catch(console.error);
            return { message: 'Livraison validée avec succès.', orderId: id };
        });
    }

    /**
     * Nettoie les commandes abandonnées en paiement (Phase 12 - Hygiène)
     * Utile pour libérer le stock théorique et nettoyer la base de données.
     */
    async cleanupAbandonedOrders(externalT = null) {
        const { Op } = (await import('sequelize')).default;
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const logic = async (t) => {
            const abandonedOrders = await Order.findAll({
                where: {
                    status: 'payment_pending',
                    created_at: { [Op.lt]: twoHoursAgo }
                },
                transaction: t
            });

            for (const order of abandonedOrders) {
                console.log(`🧹 Cleaning up abandoned order #${order.id}`);
                await this.cancelOrder(order.id, null, 'system', t);
            }
            return abandonedOrders.length;
        };

        if (externalT) return await logic(externalT);
        return await sequelize.transaction(logic);
    }
}
