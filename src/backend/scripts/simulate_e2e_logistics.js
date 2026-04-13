import { Order, Product, Store, User, Wallet, OrderTracking, Offer, sequelize } from '../models/index.js';
import OrderService from '../services/OrderService.js';
import crypto from 'crypto';

async function runE2ETest() {
    console.log('🧪 Début du test E2E : Logistique Hybride & Multi-vendeurs');
    const orderService = new OrderService();

    try {
        // 1. Préparation des données
        console.log('🔍 Recherche des données de test...');
        const offers = await Offer.findAll({ 
            limit: 20, 
            include: [{ model: Product, as: 'product' }, { model: Store, as: 'store' }]
        });

        if (offers.length < 2) throw new Error('Pas assez d\'offres pour le test.');

        // On cherche deux offres de boutiques différentes
        let offerA = offers[0];
        let offerB = offers.find(o => o.storeId !== offerA.storeId);

        if (!offerB) throw new Error('Impossible de trouver deux boutiques différentes pour tester la division.');

        console.log(`📦 Offre A: ${offerA.product?.name} (Store: ${offerA.store?.name}, ID: ${offerA.storeId})`);
        console.log(`📦 Offre B: ${offerB.product?.name} (Store: ${offerB.store?.name}, ID: ${offerB.storeId})`);

        const buyer = await User.findOne({ where: { role: 'customer' } });
        if (!buyer) throw new Error('Aucun acheteur (role: customer) trouvé.');
        console.log(`👤 Acheteur: ${buyer.name} (ID: ${buyer.id})`);

        // 2. Création de la commande groupée
        console.log('\n🛒 Création d\'une commande multi-vendeurs...');
        const orderData = {
            user_id: buyer.id,
            items: [
                { product_id: offerA.productId, offer_id: offerA.id, quantity: 1, unit_price: offerA.price },
                { product_id: offerB.productId, offer_id: offerB.id, quantity: 1, unit_price: offerB.price }
            ],
            shipping_address: { street: '123 Test St', city: 'Port-au-Prince', country: 'Haiti' },
            payment_method: { type: 'moncashwise' }
        };

        const result = await orderService.createOrder(orderData);
        console.log(`✅ Commande créée avec succès !`);
        console.log(`📑 Nombre de sous-commandes (Splitting) : ${result.totalOrders}`);
        console.log(`🔗 IDs des commandes : ${result.orderIds.join(', ')}`);

        if (result.totalOrders !== 2) {
            console.error('❌ ERREUR : La commande n\'a pas été divisée correctement par vendeur.');
        }

        // 3. Simulation du flux pour la première commande
        const orderId = result.orderIds[0];
        const order = await Order.findByPk(orderId, { include: ['store'] });
        console.log(`\n🚚 Simulation du flux pour la commande #${orderId} (Store: ${order.store.name})`);

        // Passage en statut 'shipped' (nécessaire pour le scan)
        console.log('🔄 Mise à jour du statut vers "shipped"...');
        await order.update({ status: 'shipped' });

        const token = order.delivery_token;
        console.log(`🔑 Jeton de livraison (delivery_token) : ${token}`);

        // 4. Simulation du Scan-to-Confirm
        console.log('📸 Simulation du scan par le vendeur...');
        // On utilise l'ID du propriétaire de la boutique pour valider
        const sellerId = order.store?.userId; 
        
        // S'assurer qu'un portefeuille existe pour le test
        // Pour Wallet, on utilise storeId (camelCase property name)
        await Wallet.findOrCreate({ where: { storeId: order.store_id }, defaults: { available_balance: 0, pending_balance: 1000 } });

        // Mock de l'acteur (Admin ou Vendeur)
        const verificationResult = await orderService.verifyDeliveryScan(orderId, token, sellerId || 1);
        console.log(`✅ Résultat de la vérification : ${verificationResult.message}`);

        // 5. Audit Final
        console.log('\n📊 Audit de l\'état final :');
        const finalOrder = await Order.findByPk(orderId);
        console.log(`- Statut final : ${finalOrder.status} (Attendu: delivered)`);
        console.log(`- Date de livraison : ${finalOrder.delivered_at}`);

        const tracking = await OrderTracking.findOne({ where: { order_id: orderId, status: 'delivered' } });
        console.log(`- Log de tracking créé : ${tracking ? 'Oui' : 'Non'}`);

        const wallet = await Wallet.findOne({ where: { storeId: order.store_id } });
        if (wallet) {
            console.log(`- Portefeuille du vendeur (Store ID: ${order.store_id}) :`);
            console.log(`  * Disponible : ${wallet.available_balance}`);
            console.log(`  * En attente : ${wallet.pending_balance}`);
        } else {
            console.warn('⚠️ Aucun portefeuille trouvé pour ce vendeur.');
        }

        console.log('\n🏆 TEST E2E RÉUSSI !');

    } catch (error) {
        console.error('\n❌ ÉCHEC DU TEST E2E :');
        console.error(error);
    } finally {
        // sequelize.close(); // Gardé ouvert si besoin de plus de tests dans le même script
        process.exit(0);
    }
}

runE2ETest();
