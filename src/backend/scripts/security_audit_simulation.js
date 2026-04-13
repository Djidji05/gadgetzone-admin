import { 
    Order, Product, Store, User, Offer, sequelize, Category 
} from '../models/index.js';
import OrderController from '../controllers/OrderController.js';
import OrderService from '../services/OrderService.js';

async function runSecurityAudit() {
    console.log('🛡️ DÉMARRAGE DE L\'AUDIT DE SÉCURITÉ GADGETZONE');
    console.log('============================================');
    
    const results = [];
    const orderService = new OrderService();

    try {
        // --- SETUP ---
        const attackerA = await User.create({ name: 'ATTACKER_A', email: `atk_a_${Date.now()}@test.com`, password: 'password', role: 'customer' });
        const attackerB = await User.create({ name: 'ATTACKER_B', email: `atk_b_${Date.now()}@test.com`, password: 'password', role: 'customer' });
        const attackerV = await User.create({ name: 'ATTACKER_V', email: `atk_v_${Date.now()}@test.com`, password: 'password', role: 'seller' });
        
        const storeV = await Store.create({ name: 'ATK_Store', userId: attackerV.id, status: 'active' });
        const category = await Category.findOne() || await Category.create({ name: 'Test' });
        const product = await Product.create({ name: 'Secret Product', price: 10000, stock: 10, storeId: storeV.id, category_id: category.id });
        const offer = await Offer.create({ productId: product.id, storeId: storeV.id, price: 10000, stock: 10, is_active: true });

        // Créer une commande légitime pour Attacker A
        const orderA = await orderService.createOrder({
            user_id: attackerA.id,
            items: [{ product_id: product.id, offer_id: offer.id, quantity: 1, unit_price: 10000 }],
            shipping_address: 'Secret Location'
        });
        const orderIdA = orderA.orderIds[0];

        console.log(`\n🔍 Environnement prêt. Commande cible: #${orderIdA}`);

        // --- TEST 1: IDOR (Lecture) ---
        console.log('🧪 TEST 1: Tentative de lecture IDOR par un autre utilisateur...');
        const req1 = { params: { id: orderIdA }, user: attackerB }; // Attacker B essaie de lire Order A
        const res1 = { 
            status: function(s) { this.statusCode = s; return this; },
            json: function(j) { this.data = j; return this; }
        };
        await OrderController.getOrderById(req1, res1);
        
        if (res1.statusCode === 403) {
            console.log('✅ PASS: Accès refusé (IDOR bloqué).');
            results.push({ test: 'IDOR_READ', status: 'PASS' });
        } else {
            console.error('❌ FAIL: IDOR_READ a réussi ou a renvoyé un mauvais code status:', res1.statusCode);
            results.push({ test: 'IDOR_READ', status: 'FAIL' });
        }

        // --- TEST 2: Price Manipulation ---
        console.log('\n🧪 TEST 2: Tentative de manipulation de prix...');
        // On tente de créer une commande avec un prix de 1G au lieu de 10000G
        const payload2 = {
            user_id: attackerA.id,
            items: [{ product_id: product.id, offer_id: offer.id, quantity: 1, unit_price: 1.0 }], // Tentative de fraude
            shipping_address: 'Hack St'
        };
        const order2Result = await orderService.createOrder(payload2);
        const order2 = await Order.findByPk(order2Result.orderIds[0]);
        
        if (Number(order2.total_amount) >= 10000) {
            console.log('✅ PASS: Le prix a été forcé par l\'offre système (Fraude bloquée).');
            results.push({ test: 'PRICE_MANIP', status: 'PASS' });
        } else {
            console.error('❌ FAIL: Le système a accepté le prix frauduleux de 1.0G !');
            results.push({ test: 'PRICE_MANIP', status: 'FAIL' });
        }

        // --- TEST 3: Escalade de Privilèges ---
        console.log('\n🧪 TEST 3: Tentative d\'accès Admin par un Client...');
        const req3 = { query: {}, user: attackerA }; // Client A
        const res3 = { 
            status: function(s) { this.statusCode = s; return this; },
            json: function(j) { this.data = j; return this; }
        };
        await OrderController.getAllOrders(req3, res3);

        if (res3.statusCode === 403) {
            console.log('✅ PASS: Accès admin refusé au client.');
            results.push({ test: 'PRIV_ESCALATION', status: 'PASS' });
        } else {
            console.error('❌ FAIL: Le client a pu accéder à la route admin getAllOrders !');
            results.push({ test: 'PRIV_ESCALATION', status: 'FAIL' });
        }

        // --- TEST 4: Scan Bypass (IDOR Vendor) ---
        console.log('\n🧪 TEST 4: Tentative de Scan par un vendeur tiers...');
        // Nouveau vendeur Attacker V2
        const attackerV2 = await User.create({ name: 'ATTACKER_V2', email: `atk_v2_${Date.now()}@test.com`, password: 'password', role: 'seller' });
        const storeV2 = await Store.create({ name: 'ATK_Store_2', userId: attackerV2.id, status: 'active' });
        
        try {
            const token = (await Order.findByPk(orderIdA)).delivery_token;
            // Attacker V2 tente de scanner la commande du Vendeur V1
            await orderService.verifyDeliveryScan(orderIdA, token, attackerV2.id);
            console.error('❌ FAIL: Le vendeur tiers a pu valider la livraison d\'un concurrent !');
            results.push({ test: 'SCAN_BYPASS', status: 'FAIL' });
        } catch (error) {
            if (error.message.includes('Accès refusé')) {
                console.log('✅ PASS: Scan par un tiers bloqué.');
                results.push({ test: 'SCAN_BYPASS', status: 'PASS' });
            } else {
                console.error('❌ FAIL: Erreur inattendue:', error.message);
                results.push({ test: 'SCAN_BYPASS', status: 'FAIL' });
            }
        }

        // --- CLEANUP ---
        console.log('\n🧹 Nettoyage des données d\'audit...');
        await Order.destroy({ where: { user_id: [attackerA.id, attackerB.id, attackerV.id, attackerV2.id] } });
        await Store.destroy({ where: { userId: [attackerV.id, attackerV2.id] } });
        await User.destroy({ where: { id: [attackerA.id, attackerB.id, attackerV.id, attackerV2.id] } });
        
        console.log('\n📊 RÉSUMÉ FINAL DE L\'AUDIT :');
        console.table(results);

    } catch (error) {
        console.error('❌ CRASH D\'AUDIT:', error);
    } finally {
        process.exit(0);
    }
}

runSecurityAudit();
