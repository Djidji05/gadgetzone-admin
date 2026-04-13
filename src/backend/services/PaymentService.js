import BaseService from './BaseService.js';
import OrderRepository from '../repositories/OrderRepository.js';
import monCashService from './moncash.service.js';
import { OrderLog, Boost, Product, Offer, Referral, User, sequelize } from '../models/index.js';
import { notifyNewOrder } from '../utils/notificationHelper.js';
import { emailQueue, addJob } from '../config/queues.js';

export default class PaymentService extends BaseService {
    constructor() {
        const repository = new OrderRepository();
        super(repository);
    }

    /**
     * Initie un paiement MonCash
     */
    async initiateMonCashPayment(orderId, amount, userId, returnUrl = null) {
        // Redirection logic for regular orders
        const isBoost = String(orderId).startsWith('BOOST_');

        let redirectUrl;
        if (!isBoost) {
            const order = await this.repository.findById(orderId);
            if (!order) throw new Error('Order not found');

            // 🛡️ SÉCURITÉ : Vérifier que la commande appartient à l'utilisateur
            if (userId && order.user_id !== userId) {
                console.error(`❌ Security Violation: User ${userId} tried to initiate payment for Order ${orderId} (Owner: ${order.user_id})`);
                throw new Error('Action interdite : Cette commande ne vous appartient pas.');
            }

            redirectUrl = await monCashService.createPayment(orderId, amount, returnUrl);
        } else {
            // Pour les boosts, la vérification peut être faite si nécessaire 
            // (mais le boostId est généralement créé par le vendeur lui-même au moment t)
            redirectUrl = await monCashService.createPayment(orderId, amount, returnUrl);
        }

        const urlObj = new URL(redirectUrl);
        const token = urlObj.searchParams.get('token');

        if (token) {
            if (isBoost) {
                const boostId = orderId.replace('BOOST_', '');
                await Boost.update({ payment_token: token }, { where: { id: boostId } });
            } else {
                const order = await this.repository.findById(orderId);
                // 🔗 PROPAGATION DU TOKEN : Si la commande fait partie d'un groupe (multi-vendeurs)
                if (order && order.payment_group_id) {
                    const groupId = order.payment_group_id;
                    const { Order } = await import('../models/index.js');
                    await Order.update(
                        { payment_token: token, payment_method: 'MonCash' },
                        { where: { payment_group_id: groupId, user_id: order.user_id } }
                    );
                } else {
                    await this.repository.update(orderId, {
                        payment_token: token,
                        payment_method: 'MonCash'
                    });
                }
            }
        }

        return redirectUrl;
    }

    /**
     * Traite un webhook MonCash
     */
    async processMonCashWebhook(payload) {
        console.log('🔔 MonCash Webhook Received:', payload);
        const { OrderLog } = await import('../models/index.js');
        const { orderId, transactionId } = payload;

        // 📝 JOURNALISATION D'AUDIT : Tracer la réception brute du webhook
        try {
            if (orderId) {
                await OrderLog.create({
                    order_id: String(orderId).startsWith('BOOST_') ? null : orderId,
                    action: 'webhook_received',
                    details: JSON.stringify(payload)
                });
            }
        } catch (logError) {
            console.error('⚠️ Could not log incoming webhook:', logError);
        }

        if (!orderId) {
            console.error('❌ Webhook Error: Missing orderId');
            return false;
        }

        const paymentDetails = await monCashService.retrieveOrder(orderId);
        if (paymentDetails && paymentDetails.status === 'successful') {
            const paidAmount = Number(paymentDetails.amount);
            
            if (String(orderId).startsWith('BOOST_')) {
                const boostId = orderId.replace('BOOST_', '');
                const boost = await Boost.findByPk(boostId);
                
                // Vérification du montant pour les boosts
                if (boost && Math.abs(Number(boost.price) - paidAmount) > 0.01) {
                    console.error(`❌ Webhook Amount Mismatch [Boost ${boostId}]: Expected ${boost.price}, got ${paidAmount}`);
                    return false;
                }
                
                await this.finalizeBoostPayment(boostId, transactionId || paymentDetails.transaction_id || 'moncash_trans');
            } else {
                const targetOrder = await this.repository.findById(orderId);
                if (!targetOrder) {
                    console.error(`❌ Webhook Error: Order ${orderId} not found`);
                    return false;
                }

                // 📦 GESTION DES PAIEMENTS GROUPÉS (Multi-vendeurs)
                // On récupère toutes les commandes liées par le même ID de groupe
                const { Order } = await import('../models/index.js');
                const orderGroup = await Order.findAll({
                    where: { payment_group_id: targetOrder.payment_group_id || null, payment_token: targetOrder.payment_token },
                    include: ['items']
                });

                const groupTotal = orderGroup.reduce((sum, o) => sum + Number(o.total_amount), 0);

                // SÉCURITÉ CRITIQUE: Vérifier que le montant payé correspond au total du GROUPE
                if (Math.abs(groupTotal - paidAmount) > 0.01) {
                    console.error(`❌ Webhook Amount Mismatch [Group]: Expected ${groupTotal}, got ${paidAmount}`);
                    
                    for (const o of orderGroup) {
                        await OrderLog.create({
                            order_id: o.id,
                            action: 'payment_mismatch',
                            details: `Tentative de validation groupée avec montant incorrect. Groupe: ${groupTotal}, Reçu: ${paidAmount}.`
                        });
                    }
                    return false;
                }

                // 🏛️ ATOMICITÉ DE GROUPE (Phase 10)
                const { sequelize } = await import('../models/index.js');
                try {
                    await sequelize.transaction(async (t) => {
                        for (const o of orderGroup) {
                            await this.finalizePayment(o, transactionId || paymentDetails.transaction_id || 'moncash_trans', t);
                        }
                    });
                    console.log(`✅ Group Payment successfully finalized for ${orderGroup.length} orders.`);
                } catch (groupError) {
                    console.error('❌ Error during Atomic Group Finalization:', groupError);
                    throw groupError; // Relancer pour une nouvelle tentative du webhook
                }
            }
            return true;
        }

        console.warn(`⚠️ Payment for Order ${orderId} not verified or failed`);
        return false;
    }

    /**
     * Finalise le paiement d'une commande
     */
    async finalizePayment(order, transactionId, externalT = null) {
        const logic = async (t) => {
            // 🔒 VERROUILLAGE ATOMIQUE : Recharger la commande avec un verrou de ligne
            const { Order, OrderItem, Product, Offer, Referral, Wallet, OrderLog, Store } = await import('../models/index.js');
            const lockedOrder = await Order.findByPk(order.id, { 
                transaction: t,
                lock: t.LOCK.UPDATE 
            });

            if (!lockedOrder || lockedOrder.status === 'confirmed') return;

            // 1. Mettre à jour le statut de la commande
            await lockedOrder.update({
                status: 'confirmed',
                confirmed_at: new Date(),
                transaction_id: transactionId,
                payment_method: 'MonCash'
            }, { transaction: t });

            // 2. Décomptage du stock
            for (const item of (lockedOrder.items || order.items || [])) {
                await Product.decrement('stock', { where: { id: item.product_id }, by: item.quantity, transaction: t });
                await Product.increment('sales_count', { where: { id: item.product_id }, by: item.quantity, transaction: t });

                if (item.offer_id) {
                    await Offer.decrement('stock', { where: { id: item.offer_id }, by: item.quantity, transaction: t });
                    await Offer.increment('sales_count', { where: { id: item.offer_id }, by: item.quantity, transaction: t });
                }
            }

            // 2.5 LOGIQUE FINANCIÈRE : Créditer les fonds en attente
            const storeItems = await OrderItem.findAll({ 
                where: { order_id: order.id },
                include: [{ model: Product, as: 'product' }],
                transaction: t
            });

            if (storeItems.length > 0 && storeItems[0].product) {
                const storeId = storeItems[0].product.storeId;
                const store = await Store.findByPk(storeId, { transaction: t });
                
                if (store) {
                    const itemSubtotal = storeItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
                    const commissionRate = Number(store.commission_rate || 0);
                    const commission = itemSubtotal * (commissionRate / 100);
                    const netAmount = itemSubtotal - commission;

                    await lockedOrder.update({
                        seller_commission_rate: commissionRate,
                        seller_net_amount: netAmount
                    }, { transaction: t });

                    const [wallet] = await Wallet.findOrCreate({ 
                        where: { storeId },
                        defaults: { available_balance: 0, pending_balance: 0 },
                        transaction: t
                    });

                    await wallet.increment('pending_balance', { by: netAmount, transaction: t });
                }
            }

            // 3. Gestion des commissions de parrainage
            await Referral.update({ status: 'confirmed' }, { where: { order_id: order.id }, transaction: t });

            // 4. Log de l'action
            await OrderLog.create({
                order_id: order.id,
                action: 'payment_confirmed',
                old_status: lockedOrder.status,
                new_status: 'confirmed',
                details: `Paiement confirmé via MonCash. TransID: ${transactionId}. Stock décompté.`
            }, { transaction: t });
        };

        await this.wrapFinalization(externalT, logic);

        // 5. Notifications et Emails (Post-transaction)
        setImmediate(async () => {
            try {
                const detailedOrder = await this.repository.findDetailed(order.id);
                await notifyNewOrder(detailedOrder);

                if (detailedOrder.user && detailedOrder.user.email) {
                    await addJob(emailQueue, 'order-confirmation', {
                        to: detailedOrder.user.email,
                        subject: `Confirmation de commande #${detailedOrder.order_number || detailedOrder.id}`,
                        data: { orderId: detailedOrder.id, total: detailedOrder.total_amount, customerName: detailedOrder.user.name }
                    });
                }
            } catch (notifyError) {
                console.error('❌ Error during post-payment notifications:', notifyError);
            }
        });
    }

    /**
     * Vérifie manuellement un paiement (Polling)
     */
    async verifyPaymentStatic(orderId) {
        const isBoost = String(orderId).startsWith('BOOST_');
        let orderOrBoost;

        if (isBoost) {
            const boostId = orderId.replace('BOOST_', '');
            orderOrBoost = await Boost.findByPk(boostId);
        } else {
            orderOrBoost = await this.repository.findDetailed(orderId);
        }

        if (!orderOrBoost || orderOrBoost.status !== 'pending') return null;

        const paymentDetails = await monCashService.retrieveOrder(orderId);
        if (paymentDetails && paymentDetails.status === 'successful') {
            const paidAmount = Number(paymentDetails.amount);

            if (isBoost) {
                // Vérification du montant pour les boosts
                if (Math.abs(Number(orderOrBoost.price) - paidAmount) > 0.01) {
                    console.error(`❌ Verification Amount Mismatch [Boost ${orderOrBoost.id}]: Expected ${orderOrBoost.price}, got ${paidAmount}`);
                    return false;
                }
                await this.finalizeBoostPayment(orderOrBoost.id, paymentDetails.transaction_id || 'moncash_verify');
            } else {
                // SÉCURITÉ CRITIQUE: Vérification du montant pour les commandes
                // 📦 Support Multi-Vendeurs dans la vérification statique
                let totalToVerify = Number(orderOrBoost.total_amount);
                let ordersToFinalize = [orderOrBoost];

                if (orderOrBoost.payment_group_id) {
                    const { Order } = await import('../models/index.js');
                    const group = await Order.findAll({
                        where: { payment_group_id: orderOrBoost.payment_group_id, payment_token: orderOrBoost.payment_token },
                        include: ['items']
                    });
                    totalToVerify = group.reduce((sum, o) => sum + Number(o.total_amount), 0);
                    ordersToFinalize = group;
                }

                if (Math.abs(totalToVerify - paidAmount) > 0.01) {
                    console.error(`❌ Verification Amount Mismatch: Expected ${totalToVerify}, got ${paidAmount}`);
                    return false;
                }

                for (const o of ordersToFinalize) {
                    await this.finalizePayment(o, paymentDetails.transaction_id || 'moncash_verify');
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Finalise le paiement d'un Boost
     */
    async finalizeBoostPayment(boostId, transactionId) {
        await sequelize.transaction(async (t) => {
            // 🔒 VERROUILLAGE ATOMIQUE : Recharger le boost avec verrou
            const lockedBoost = await Boost.findByPk(boostId, { 
                transaction: t,
                lock: t.LOCK.UPDATE 
            });

            if (!lockedBoost || lockedBoost.status !== 'pending') return;

            const now = new Date();
            const endsAt = new Date(now.getTime() + lockedBoost.duration_days * 24 * 60 * 60 * 1000);

            await lockedBoost.update({
                status: 'active',
                transaction_id: transactionId,
                startsAt: now,
                endsAt: endsAt,
                updated_at: now
            }, { transaction: t });

            // Activer le flag sur le produit pour un accès rapide
            await Product.update(
                { is_sponsored: true },
                { where: { id: lockedBoost.productId }, transaction: t }
            );
        });

        console.log(`🚀 Boost ${boostId} partially activated and Product marked.`);
    }

    /**
     * Moteur de RÉCONCILIATION : Rattrapage proactif des paiements manqués (Phase 12)
     * Utile si le Webhook ET le Polling échouent simultanément.
     */
    async reconcilePendingPayments() {
        const { Order } = await import('../models/index.js');
        const { Op } = (await import('sequelize')).default;
        
        // On vérifie les commandes de plus de 30 minutes mais de moins de 24h
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const pendingOrders = await Order.findAll({
            where: {
                status: 'payment_pending',
                created_at: { [Op.between]: [yesterday, thirtyMinutesAgo] }
            }
        });

        console.log(`🔍 Reconciliation: Scanning ${pendingOrders.length} pending orders...`);
        let recovered = 0;

        for (const order of pendingOrders) {
            try {
                // Interroger MonCash pour connaître le statut réel
                const paymentDetails = await monCashService.retrieveOrder(order.id);
                
                if (paymentDetails && paymentDetails.status === 'successful') {
                    console.log(`🎯 Reconciliation SUCCESS for Order #${order.id}. Finalizing...`);
                    // On utilise le webhook logic pour finaliser (groupés ou non)
                    await this.processMonCashWebhook(paymentDetails);
                    recovered++;
                }
            } catch (err) {
                console.error(`❌ Reconciliation failed for Order #${order.id}:`, err.message);
            }
        }

        return { scanned: pendingOrders.length, recovered };
    }

    // Aide pour gérer la fin du bloc finalizePayment
    async wrapFinalization(externalT, logic) {
        if (externalT) {
            await logic(externalT);
        } else {
            const { sequelize } = await import('../models/index.js');
            await sequelize.transaction(async (t) => {
                await logic(t);
            });
        }
    }
}
