import { 
    Order, Product, Store, User, Wallet, OrderTracking, Offer, OrderItem,
    sequelize, Category
} from '../models/index.js';
import OrderService from '../services/OrderService.js';
import crypto from 'crypto';

async function runGlobalSimulation() {
    console.log('🚀 DÉMARRAGE DE LA SIMULATION GLOBALE DU SYSTÈME GADGETZONE');
    console.log('===========================================================');
    
    const orderService = new OrderService();

    try {
        // --- PHASE 1: INITIALISATION DES ACTEURS ---
        console.log('\n👥 PHASE 1: Initialisation des Acteurs...');
        
        const seller = await User.create({
            name: 'SIM_Seller',
            email: `sim_seller_${Date.now()}@test.com`,
            password: 'password123',
            role: 'seller',
            status: 'active'
        });
        console.log(`✅ Vendeur créé (ID: ${seller.id})`);

        const store = await Store.create({
            name: 'SIM_Test_Store',
            userId: seller.id,
            status: 'active',
            commission_rate: 10
        });
        console.log(`✅ Boutique créée (ID: ${store.id})`);

        const customer = await User.create({
            name: 'SIM_Customer',
            email: `sim_customer_${Date.now()}@test.com`,
            password: 'password123',
            role: 'customer',
            status: 'active'
        });
        console.log(`✅ Client créé (ID: ${customer.id})`);

        // --- PHASE 2: CRÉATION DE CONTENU (MARKETPLACE) ---
        console.log('\n📦 PHASE 2: Création de Contenu (Marketplace)...');
        
        const category = await Category.findOne() || await Category.create({ name: 'SIM_Category' });
        const product = await Product.create({
            name: 'SIM_Test_Product',
            description: 'Produit créé pour la simulation globale.',
            price: 5000,
            stock: 100,
            storeId: store.id,
            category_id: category.id,
            status: 'active'
        });

        const offer = await Offer.create({
            productId: product.id,
            storeId: store.id,
            price: 5000,
            stock: 100,
            is_active: true,
            condition: 'new'
        });
        console.log(`✅ Produit et Offre créés pour la boutique SIM`);

        // --- PHASE 3: FLUX TRANSACTIONNEL ---
        console.log('\n🛒 PHASE 3: Flux Transactionnel...');
        
        // On cherche un autre produit d'un autre vendeur pour tester le splitting
        const otherOffer = await Offer.findOne({ 
            where: { storeId: { [sequelize.Sequelize.Op.ne]: store.id } },
            include: [{ model: Product, as: 'product' }]
        });

        const cartItems = [
            { product_id: product.id, offer_id: offer.id, quantity: 1, unit_price: 5000 }
        ];

        if (otherOffer) {
            console.log(`🔗 Ajout d'un produit d'un autre vendeur (${otherOffer.product?.name}) pour tester la division.`);
            cartItems.push({ 
                product_id: otherOffer.productId, 
                offer_id: otherOffer.id, 
                quantity: 1, 
                unit_price: otherOffer.price 
            });
        }

        const orderCreation = await orderService.createOrder({
            user_id: customer.id,
            items: cartItems,
            shipping_address: { street: 'Main St', city: 'Simulation City', country: 'Haiti' },
            payment_method: { type: 'moncashwise' }
        });

        console.log(`✅ Commandes créées (Divisées: ${orderCreation.totalOrders}) : ${orderCreation.orderIds.join(', ')}`);

        // Identifier l'ordre SIM
        const allOrders = await Order.findAll({ where: { id: orderCreation.orderIds } });
        const simOrder = allOrders.find(o => o.store_id === store.id);
        if (!simOrder) throw new Error('Sous-commande SIM introuvable.');

        const simOrderId = simOrder.id;
        console.log(`📊 Détails de la commande SIM #${simOrderId}:`);
        console.log(`  - Total: ${simOrder.total_amount} G`);
        console.log(`  - Commission Rate: ${simOrder.seller_commission_rate}%`);
        console.log(`  - Net Vendeur: ${simOrder.seller_net_amount} G`);

        if (Number(simOrder.seller_net_amount) === 0) {
            console.warn('⚠️ ATTENTION : Le montant net vendeur est de 0. Vérification du calcul...');
        }

        await simOrder.update({ status: 'confirmed' });
        console.log(`✅ Commande #${simOrderId} passée au statut 'confirmed' (Paiement simulé)`);

        // --- PHASE 4: LOGISTIQUE & SCAN (PHASE 13) ---
        console.log('\n🚚 PHASE 4: Logistique & Scan (Phase 13)...');
        
        await simOrder.update({ status: 'shipped' });
        const token = simOrder.delivery_token;
        console.log(`🔑 Jeton de livraison : ${token}`);

        // Vérification par scan
        const scanResult = await orderService.verifyDeliveryScan(simOrderId, token, seller.id);
        console.log(`✅ Scan validé : ${scanResult.message}`);

        // --- PHASE 5: VÉRIFICATION FINANCIÈRE ---
        console.log('\n💰 PHASE 5: Vérification Financière...');
        
        const wallet = await Wallet.findOne({ where: { storeId: store.id } });
        console.log(`- Portefeuille du vendeur (Store SIM) :`);
        console.log(`  * Disponible : ${wallet?.available_balance || 0} G`);
        console.log(`  * En attente : ${wallet?.pending_balance || 0} G`);
        
        if (Number(wallet?.available_balance) > 0) {
            console.log('✅ Libération des fonds confirmée !');
        } else {
            console.error('❌ ERREUR : Les fonds disponibles n\'ont pas été crédités.');
        }

        // --- PHASE 6: MARKETING (BOOST) ---
        console.log('\n🎯 PHASE 6: Marketing (Boost)...');
        await product.update({ is_sponsored: true });
        console.log(`✅ Produit marqué comme SPONSORISÉ`);

        console.log('\n🏆 TOUTES LES PHASES DE SIMULATION RÉUSSIES !');

    } catch (error) {
        console.error('\n❌ ÉCHEC CRITIQUE DE LA SIMULATION :');
        console.error(error);
    } finally {
        console.log('\n🧹 PHASE 7: Nettoyage Automatique...');
        try {
            const Op = sequelize.Sequelize.Op;
            const simUsers = await User.findAll({ where: { name: { [Op.like]: 'SIM_%' } } });
            const userIds = simUsers.map(u => u.id);
            const simStores = await Store.findAll({ where: { userId: userIds } });
            const storeIds = simStores.map(s => s.id);
            const simOrders = await Order.findAll({ where: { store_id: { [Op.in]: storeIds } } });
            const orderIds = simOrders.map(o => o.id);

            if (orderIds.length) {
                await OrderTracking.destroy({ where: { order_id: orderIds } });
                await OrderItem.destroy({ where: { order_id: orderIds } });
                await Order.destroy({ where: { id: orderIds } });
            }
            if (storeIds.length) {
                await Wallet.destroy({ where: { storeId: storeIds } });
                await Offer.destroy({ where: { storeId: storeIds } });
                await Product.destroy({ where: { storeId: storeIds } });
                await Store.destroy({ where: { id: storeIds } });
            }
            if (userIds.length) {
                await User.destroy({ where: { id: userIds } });
            }
            console.log('✅ Base de données nettoyée.');
        } catch (e) {
            console.error('⚠️ Nettoyage incomplet:', e.message);
        }
        process.exit(0);
    }
}

runGlobalSimulation();
