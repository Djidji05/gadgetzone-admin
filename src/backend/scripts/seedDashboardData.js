import sequelize from '../config/database.js';
import { Product, Order, OrderItem, User } from '../models/index.js';

/**
 * Script pour créer des commandes complètes avec des produits
 */
async function createCompleteOrders() {
    try {
        console.log('🛒 Création de commandes complètes avec produits...\n');

        // Récupérer un utilisateur
        const user = await User.findOne({ where: { role: 'admin' } });
        if (!user) {
            console.log('❌ Aucun utilisateur trouvé');
            return;
        }

        // Récupérer des produits
        const products = await Product.findAll({ limit: 5 });
        if (products.length === 0) {
            console.log('❌ Aucun produit trouvé');
            return;
        }

        console.log(`✅ Utilisateur trouvé: ${user.name}`);
        console.log(`✅ ${products.length} produits trouvés\n`);

        // Créer 5 commandes livrées
        for (let i = 0; i < 5; i++) {
            let totalAmount = 0;
            const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 produits par commande

            // Créer la commande
            const order = await Order.create({
                user_id: user.id,
                total_amount: 0, // On va le calculer
                status: 'delivered',
                shipping_address: JSON.stringify({
                    street: `${100 + i} Rue de la Paix`,
                    city: 'Paris',
                    postalCode: '75001',
                    country: 'France'
                }),
                created_at: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)) // Échelonné sur 10 jours
            });

            // Ajouter des produits à la commande
            for (const product of orderProducts) {
                const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 unités
                const price = parseFloat(product.price);

                await OrderItem.create({
                    order_id: order.id,
                    product_id: product.id,
                    quantity: quantity,
                    price: price
                });

                totalAmount += price * quantity;
            }

            // Mettre à jour le total de la commande
            await order.update({ total_amount: totalAmount });

            console.log(`✅ Commande #${order.id} créée: ${orderProducts.length} produits, ${totalAmount.toFixed(2)}€`);
        }

        // Afficher les statistiques finales
        console.log('\n📊 Statistiques finales:');
        const [stats] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as commandes_livrees,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered') as ca_total,
        (SELECT COALESCE(SUM(oi.quantity), 0) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.status = 'delivered') as produits_vendus
    `, { type: sequelize.QueryTypes.SELECT });

        console.table(stats);
        console.log('\n✅ Données créées avec succès! Rafraîchissez votre dashboard.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

createCompleteOrders();
